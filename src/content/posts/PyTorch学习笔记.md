---
title: PyTorch 学习笔记
published: 2025-12-01
tags: [PyTorch, 深度学习, 学习笔记]
category: 学习笔记
draft: false
---
## PyTorch 核心知识点整理

## 一、基础概念

### 1.1 Tensor（张量）
- 核心数据结构：类似于 NumPy 的 ndarray，但支持 GPU 加速和自动求导。
- 创建方式：

  ```python
  import torch

  # 从 Python 列表或 NumPy 数组创建
  x = torch.tensor([1, 2, 3])

  # 创建特定值的张量
  a = torch.zeros((2, 3))
  b = torch.ones((2, 3))
  c = torch.rand((2, 3))
  d = torch.randn((2, 3))

  # 创建序列
  r1 = torch.arange(0, 10, 2)
  r2 = torch.linspace(0, 1, 5)

  # 创建单位矩阵
  i = torch.eye(3)
  ```

- 属性：

  ```python
  x.dtype
  x.shape
  x.size()
  x.device
  x.requires_grad
  ```

- 操作：
  - 索引与切片：与 NumPy 类似。
  - 视图 (View) 与 复制 (Copy)：

    ```python
    y = x.view(-1)          # 返回一个新视图，共享底层数据（要求内存连续）
    z = x.reshape(-1)       # 更灵活的形状变换，可能返回视图或副本
    x_copy = x.clone()      # 返回数据的副本
    ```

  - 数学运算：

    ```python
    s = torch.sum(x)
    m = torch.mean(x.float())
    mx = torch.max(x)
    e = torch.exp(x.float())
    lg = torch.log(x.float())
    ```

  - 广播 (Broadcasting)：自动扩展张量以进行运算。
  - 类型转换：

    ```python
    xf = x.float()
    xl = x.long()
    x2 = x.to(dtype=torch.float32)
    ```

  - 设备转移：

    ```python
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    x_gpu = x.to(device)
    x_cpu = x_gpu.cpu()
    ```

### 1.2 自动求导（Autograd）
- 核心机制：PyTorch 能自动计算张量的梯度。
- 关键属性：

  ```python
  import torch

  # requires_grad: 设置张量需要计算梯度（通常对模型参数设置）
  w = torch.randn(10, requires_grad=True)

  # grad: 存储计算得到的梯度
  w.grad

  # grad_fn: 指向创建该张量的 Function 对象，用于构建计算图
  y = w * 2
  y.grad_fn
  ```

- 基本流程：

  ```python
  import torch

  x = torch.randn(10)
  w = torch.randn(10, requires_grad=True)
  b = torch.randn(1, requires_grad=True)

  y = (x * w).sum() + b
  loss = y

  loss.backward()

  with torch.no_grad():
      w -= 0.01 * w.grad
      b -= 0.01 * b.grad

  w.grad.zero_()
  b.grad.zero_()
  ```

- 停止梯度：

  ```python
  import torch

  x = torch.randn(3, requires_grad=True)

  with torch.no_grad():
      y = x * 2

  z = x.detach()
  x.requires_grad_(False)
  ```

## 二、神经网络模块

### 2.1 定义网络

- 常见写法：

  ```python
  import torch
  import torch.nn as nn

  class MyModel(nn.Module):
      def __init__(self):
          super().__init__()
          self.net = nn.Sequential(
              nn.Linear(10, 32),
              nn.ReLU(),
              nn.Linear(32, 10),
          )

      def forward(self, x):
          return self.net(x)
  ```

- 常用层：

  ```python
  import torch.nn as nn

  nn.Linear
  nn.Conv2d
  nn.MaxPool2d
  nn.AvgPool2d
  nn.BatchNorm1d
  nn.BatchNorm2d
  nn.BatchNorm3d
  nn.Dropout
  nn.Embedding
  nn.LSTM
  nn.GRU
  ```

- 激活函数：

  ```python
  import torch.nn as nn

  nn.ReLU
  nn.Sigmoid
  nn.Tanh
  nn.Softmax
  ```

- 容器：

  ```python
  import torch.nn as nn

  nn.Sequential
  nn.ModuleList
  nn.ModuleDict
  ```

### 2.2 损失函数（Loss Functions）

- 常用损失：

  ```python
  import torch.nn as nn

  nn.MSELoss                 # 回归
  nn.CrossEntropyLoss        # 分类（输入 logits，内部会做 Softmax）
  nn.BCELoss                 # 二元交叉熵（输入概率）
  nn.BCEWithLogitsLoss       # Sigmoid + BCELoss，数值更稳定
  nn.NLLLoss                 # 负对数似然（常与 LogSoftmax 配合）
  ```

- 使用：

  ```python
  loss = criterion(predicted_output, true_target)
  ```

### 2.3 优化器（Optimizers）
- 作用：根据计算出的梯度更新模型参数。
- 常用优化器：

  ```python
  import torch

  torch.optim.SGD
  torch.optim.Adam
  torch.optim.RMSprop
  ```

- 基本使用流程：

  ```python
  optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
  loss = criterion(outputs, labels)

  optimizer.zero_grad()
  loss.backward()
  optimizer.step()
  ```

## 三、数据处理

### 3.1 Dataset
- 抽象基类：

  ```python
  from torch.utils.data import Dataset
  ```

- 自定义数据集：

  ```python
  from torch.utils.data import Dataset

  class MyCustomDataset(Dataset):
      def __len__(self):
          return 0

      def __getitem__(self, idx):
          return None
  ```

- 内置数据集：torchvision.datasets.MNIST/CIFAR10/ImageFolder 等。

  ```python
  import torchvision

  torchvision.datasets.MNIST
  torchvision.datasets.CIFAR10
  torchvision.datasets.ImageFolder
  ```

### 3.2 DataLoader
- 作用：将数据集封装成可迭代对象，支持批量加载、打乱、多进程加载。

  ```python
  from torch.utils.data import DataLoader

  DataLoader(dataset, batch_size=32, shuffle=True, num_workers=4)
  ```
- 使用：
```python
dataset = MyCustomDataset(...)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=4)

for batch_data, batch_labels in dataloader:
    # 训练/验证逻辑
    pass
```

## 四、训练与验证流程

### 4.1 基本训练循环

```python
model.train()  # 设置为训练模式（影响 Dropout, BatchNorm 等层）
for epoch in range(num_epochs):
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()  # 1. 清空梯度
        outputs = model(inputs)  # 2. 前向传播
        loss = criterion(outputs, labels)  # 3. 计算损失
        loss.backward()  # 4. 反向传播
        optimizer.step()  # 5. 更新参数

        # 可选：记录损失、准确率等
```

### 4.2 验证/测试循环

```python
model.eval()  # 设置为评估模式（关闭 Dropout, 固定 BatchNorm 统计量）
with torch.no_grad():  # 关闭梯度计算，节省内存和计算
    for inputs, labels in val_loader:
        inputs, labels = inputs.to(device), labels.to(device)
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        # 计算准确率或其他指标
        # 记录验证损失和指标
```

## 五、模型保存与加载

- 保存模型参数：
  ```python
  torch.save(model.state_dict(), "model_weights.pth")
  ```
- 加载模型参数：
  ```python
  model = MyModel()  # 先实例化模型结构
  model.load_state_dict(torch.load("model_weights.pth"))
  model.eval()  # 通常加载后用于推理，设为评估模式
  ```
- 保存整个模型（不推荐，依赖具体类定义）：
  ```python
  torch.save(model, "entire_model.pth")
  model = torch.load("entire_model.pth")
  ```

## 六、GPU 加速

- 检查 GPU 可用性：

  ```python
  import torch

  torch.cuda.is_available()
  ```

- 指定设备：

  ```python
  import torch

  device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
  ```

- 转移张量和模型：
  ```python
  tensor = tensor.to(device)
  model = model.to(device)
  ```

## 七、其他重要特性

### 7.1 TorchScript（模型部署）
- 将 PyTorch 模型转换为可序列化的、独立于 Python 的中间表示，便于在 C++ 环境或生产环境中部署。
- 常用方式：

  ```python
  import torch

  torch.jit.trace(model, example_input)
  torch.jit.script(model)
  ```

### 7.2 分布式训练
- 常用方式：

  ```python
  import torch

  torch.nn.DataParallel
  torch.nn.parallel.DistributedDataParallel
  ```

### 7.3 混合精度训练（AMP）
- 常用工具：

  ```python
  import torch

  torch.cuda.amp.autocast
  torch.cuda.amp.GradScaler
  ```

### 7.4 可视化与调试
- TensorBoard：

  ```python
  from torch.utils.tensorboard import SummaryWriter
  ```

- 打印模型结构：

  ```python
  print(model)
  ```

- 结构摘要（需安装第三方包）：

  ```python
  summary(model, input_size)
  ```

## 八、常用工具库

- TorchVision：提供图像数据集、模型架构、图像变换工具。

  ```python
  import torchvision
  ```

- TorchText：提供文本数据集和预处理工具（NLP）。

  ```python
  import torchtext
  ```

- TorchAudio：提供音频数据集和处理工具。

  ```python
  import torchaudio
  ```

## 九、最佳实践

1. 总是清空梯度：

   ```python
   optimizer.zero_grad()
   ```

2. 区分训练和评估模式：

   ```python
   model.train()
   model.eval()

   with torch.no_grad():
       pass
   ```

3. 使用数据加载器：进行批量、打乱和并行数据加载。

   ```python
   from torch.utils.data import DataLoader

   dataloader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=4)
   ```

4. 设备管理：显式地将模型和数据移动到目标设备。

   ```python
   inputs = inputs.to(device)
   labels = labels.to(device)
   model = model.to(device)
   ```

5. 保存和加载模型参数：优先保存/加载参数字典，而不是整个模型对象。

   ```python
   torch.save(model.state_dict(), "model_weights.pth")
   model.load_state_dict(torch.load("model_weights.pth"))
   ```
6. 设置随机种子：保证实验的可复现性。

   ```python
   import torch
   import numpy as np

   torch.manual_seed(42)
   np.random.seed(42)
   ```

7. 利用自动混合精度：在支持的 GPU 上加速训练。
   
   ```python
   from torch.cuda.amp import autocast, GradScaler

   scaler = GradScaler()
   with autocast():
       loss = criterion(outputs, labels)
   scaler.scale(loss).backward()
   scaler.step(optimizer)
   scaler.update()
   ```

8. 监控训练过程：记录损失、准确率、学习率等。
   
   ```python
   from torch.utils.tensorboard import SummaryWriter

   writer = SummaryWriter()
   writer.add_scalar("loss/train", loss.item(), global_step)
   writer.flush()
   ```
  

---
