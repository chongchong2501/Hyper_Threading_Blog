/**
 * 文件：types/bilibili.ts
 * 描述：定义 Bilibili 追番/追剧相关类型，仅包含页面展示所需的关键字段
 */
export type BilibiliFollowListResponse = {
	code: number;
	message: string;
	ttl: number;
	data: {
		list: BiliSeasonItem[];
		total?: number;
		page?: number;
	};
};

/**
 * 类型：B站追番/追剧条目
 * 仅保留页面渲染相关字段
 */
export type BiliSeasonItem = {
	season_id: number;
	media_id?: number;
	season_type?: number;
	season_type_name?: string;
	title: string;
	cover: string;
	square_cover?: string;
	horizontal_cover?: string;
	horizontal_cover_16_10?: string;
	total_count?: number;
	is_finish?: number; // 1=已完结, 0=未完结
	is_started?: number;
	badge?: string;
	badge_type?: number;
	stat?: {
		follow?: number;
		view?: number;
		danmaku?: number;
		reply?: number;
		coin?: number;
		series_follow?: number;
		series_view?: number;
	};
};
