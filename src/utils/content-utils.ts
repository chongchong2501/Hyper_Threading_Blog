import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		// 首先按置顶状态排序，置顶文章在前
		if (a.data.pinned && !b.data.pinned) return -1;
		if (!a.data.pinned && b.data.pinned) return 1;

		// 如果置顶状态相同，则按发布日期排序
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].id;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].id;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}

type RelatedPostCandidate = {
	post: CollectionEntry<"posts">;
	sharedTagCount: number;
	sameCategory: boolean;
	publishedTime: number;
};

/**
 * 函数级注释：统计两篇文章之间的共同标签数量，作为相关推荐的第一优先级信号。
 */
function getSharedTagCount(currentTags: string[], candidateTags: string[]): number {
	if (currentTags.length === 0 || candidateTags.length === 0) {
		return 0;
	}

	const currentTagSet = new Set(
		currentTags.map((tag) => tag.trim()).filter(Boolean),
	);
	return candidateTags.reduce((count, tag) => {
		return currentTagSet.has(tag.trim()) ? count + 1 : count;
	}, 0);
}

/**
 * 函数级注释：判断候选文章是否与当前文章属于同一分类，作为第二优先级排序信号。
 */
function isSameCategory(
	currentCategory: string | null | undefined,
	candidateCategory: string | null | undefined,
): boolean {
	if (!currentCategory || !candidateCategory) {
		return false;
	}

	return currentCategory.trim() === candidateCategory.trim();
}

/**
 * 函数级注释：为文章页生成推荐文章列表，按共同标签数、同分类、发布时间依次排序。
 */
export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	limit = 5,
): Promise<CollectionEntry<"posts">[]> {
	const allPosts = await getCollection("posts");
	const safeLimit = Math.max(0, limit);

	const relatedCandidates: RelatedPostCandidate[] = allPosts
		.filter((post) => post.id !== currentPost.id && post.data.draft !== true)
		.map((post) => ({
			post,
			sharedTagCount: getSharedTagCount(
				currentPost.data.tags ?? [],
				post.data.tags ?? [],
			),
			sameCategory: isSameCategory(
				currentPost.data.category,
				post.data.category,
			),
			publishedTime: new Date(post.data.published).getTime(),
		}));

	relatedCandidates.sort((a, b) => {
		if (b.sharedTagCount !== a.sharedTagCount) {
			return b.sharedTagCount - a.sharedTagCount;
		}

		if (a.sameCategory !== b.sameCategory) {
			return Number(b.sameCategory) - Number(a.sameCategory);
		}

		if (b.publishedTime !== a.publishedTime) {
			return b.publishedTime - a.publishedTime;
		}

		return a.post.data.title.localeCompare(b.post.data.title);
	});

	return relatedCandidates.slice(0, safeLimit).map(({ post }) => post);
}

export type PostForList = {
	id: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
