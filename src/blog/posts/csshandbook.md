---
title: CSS Debug Handbook - Layout Essentials
date: 1998-01-01
tags: blog
---
> 这是一个用来整理CSS布局系统核心知识的手册，目标是当遇到“页面怎么又崩了？！”的瞬间，可以知道从哪个角度检查问题，而不是盲目debug。
<!-- readmore -->
## 总览

| 概念           | 类比数学中的概念      | 能解决的问题                            |
| -------------- | -------------------- | ---------------------------------------- |
| `box model`    | 坐标轴、函数边界      | 判断元素为什么大小不对                  |
| `position`     | 局部/全局坐标变换     | 理解脱离文档流的行为（absolute/fixed） |
| `display`      | 函数定义域类型        | 决定元素是否是块、内联、栅格、弹性盒     |
| `flex/grid`    | 函数组合 / 多元变量分布 | 布局系统，决定空间如何分配              |
| `box-sizing`   | 函数计算值 vs 表示值  | 控制 border/padding 是否计入宽度       |
## Box Model - 元素的边界定义
已经很熟悉的概念，chrome f12中的elements中有直观的画图演示。不熟悉的是其他属性对Box的影响。
### Quick Checklist
- [x] 组成：</br>
    content（width 默认只计算 content 部分）</br>
    padding（内容和边框之间的空隙）</br>
    border（边框本身）</br>
    margin（与外部世界的空隙）
- [x] `box-sizing` 默认是 `content-box`，要手动设为 `border-box` width才会包含padding和border
- [x] inline元素不支持设置`width` `height`（需要转为`inline-block`才生效）
- [x] margin collapse发生在垂直方向的 block 元素之间

inline和inline-block混用时，为什么margin-top/margin-bottom有时候没有效果？
## Box-sizing
“一个盒子width: 100px，到底指的是哪一部分？” 是内容宽度？还是连同padding和border一起算的？
| 值             | 意义                                            |
| ------------- | --------------------------------------------- |
| `content-box` | 默认值：width/height只包括内容本身，padding和border会撑大 |
| `border-box`  | 更直观的方式：width/height包含内容 + padding + border   |
举个例子：
```
width: 100px;
padding: 10px;
border: 2px solid;
```
content-box：
内容区宽度 = 100px

最后元素总宽度 = 100+10x2+2x2=124px

border-box：
内容区宽度 = 100-10x2-2x2 =76px

最后元素总宽度 = 100px

“明明说好了100px，结果加个padding就溢出了”：可能用错了box-sizing。
## Position - 不同的坐标系
position就像不同维度的坐标系统。
| `position` 值 | 类比数学里的坐标系      | 结果                  |
| ------------ | -------------- | ------------------- |
| `static`（默认） | 全局坐标系（世界坐标）    | 不能用 top/left 移动     |
| `relative`   | 局部坐标系          | 参照元素原本位置偏移（但不脱离文档流） |
| `absolute`   | 定点系，但基于最近的定位祖先 | 完全脱离文档流，可任意定位       |
| `fixed`      | 屏幕系（视口固定坐标）    | 页面滚动时也保持原地          |
| `sticky`     | 条件固定           | 滚动到某处后“贴住”视口        |

它到底影响了什么？

首先它影响了坐标系统，决定你设置top / left / right / bottom是相对于谁的。默认static是完全不能用这些属性的。

其次它影响元素是否还在“文档流”里，static / relative 在。absolute / fixed不在，不占位，脱离正常布局。

最后，它影响z-index（图层）
没有position就不能使用z-index，设置了position（除了 static），你就有资格开始叠叠乐。

Position和元素尺寸有些间接关系：
| 位置类型       | 尺寸计算方式                       | 会不会影响外层容器高度 |
| ---------- | ---------------------------- | ---------- |
| `static`   | 按内容自动撑开                      | 会影响      |
| `relative` | 同上 + 视觉偏移（不影响其他元素位置）         | 会影响      |
| `absolute` | 必须显式指定或由子元素撑开                | 不会影响     |
| `fixed`    | 同上                           | 不会影响     |
| `sticky`   | 和relative基本一样，但条件触发变fixed | 会影响      |
所以absolute/fixed的元素，尺寸不再由周围内容影响，需要手动控制。

### 常见bug和应用
absolute / fixed适用于精确控制位置（弹窗、提示框、工具栏）

relative适用于相对偏移但不打乱结构，比如按钮内文字偏左点

sticky 适用于滚动吸附，如头部导航固定、吸底操作栏（移动端）

| 遇到的痛点       | 可能的解法                             |
| ------------ | --------------------------------- |
| 宽度/高度没对齐     | `position` 可能让它脱离流 → 它不会撑开父容器了    |
| “贴到哪里”不对     | 检查是否有最近的 `position: relative` 的祖先 |
| 被遮住 / 层级不对   | 没有设置 `z-index`，或外层容器层级影响它          |
| 本来想“微调”但整个错位 | 用了 `absolute` 不如 `relative` 合适    |


豆知识：position: sticky就像是“条件fixed”：

默认是relative

滚动到某个点时自动变成fixed
```
.sticky-header {
  position: sticky;
  top: 0;
}
```
## Display
核心问题：一个元素的显示方式是块状、内联，还是栅格 / 弹性布局容器？它能不能包住子元素？子元素的布局规则是什么？
| 值              | 作用                  | 典型用途                                |
| -------------- | ------------------- | ----------------------------------- |
| `block`        | 占据整行，可设宽高，自动换行      | `<div>`、`<section>` 等大块元素容器         |
| `inline`       | 行内显示，不能设宽高          | `<span>`、文本装饰等                      |
| `inline-block` | 行内排布，但可设宽高          | 小按钮、icon等                          |
| `flex`         | 变成弹性布局容器，子元素可弹性分配空间 | 卡片容器、导航栏、对齐等                        |
| `grid`         | 变成网格布局容器，子元素可占格子    | 复杂的界面网格，比如画廊、控制面板                   |
| `none`         | 不显示，且从文档流中移除        | 暂时隐藏元素（但注意不同于 `visibility: hidden`） |
### 排查手册
为什么设置了width没效果？：是不是display: inline？

为什么两个按钮换行了？：可能是display: block或默认布局规则

为什么排不齐？：是不是需要改成flex或grid？
## Flex
用一句话总结：flex 是“空间分配器”。
它能解决的是一类问题：

“几个元素横着（或竖着）排，怎么让它们刚好排好、对齐、拉伸、靠边、等分、缩放？”
### 结构
在 Flex 世界里，有两个层次：

外层容器（flex container）加 display: flex

子元素（flex items）自动变成“能被分配空间的对象”

一个 flex 容器可以控制两个方向：
| 方向       | 属性名                                | 控制啥          |
| -------- | ---------------------------------- | ------------ |
| 主轴（横or竖） | `flex-direction`、`justify-content` | 控制子元素如何沿主轴排列 |
| 交叉轴      | `align-items`、`align-self`         | 控制子元素在副轴上的对齐 |
主轴默认为横向：row，所以justify控横，align控竖。
### 几个常见问题的flex解法模型
模型1：两个区域，左边固定，右边填满

「我要一个按钮栏 + 内容区，按钮栏是固定宽，内容区填剩下」
```
.container {
  display: flex;
}
.sidebar {
  width: 80px;
}
.content {
  flex: 1;
}
```
flex: 1 表示“占据剩余空间”。如果多个子项都写 flex: 1，它们就平分。

模型2：一堆元素平均分布一整行
「我要五个按钮，平均分布填满一整行」

每个子项都写 flex: 1，就变成等分布局了！

模型3：靠左、靠右、居中

「我要按钮靠右」「我要文字居中」
```
.container {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  justify-content: center; /* 居中 */
}
```
就像文字对齐那样：start是左，end是右，center是中

### flex: 1 是什么？
它其实是flex-grow flex-shrink flex-basis的简写。

```
flex: 1;    /* = grow: 1, shrink: 1, basis: 0 */
```
通俗翻译：

grow: 1 有剩余空间时，我可以“抢”空间，抢得比值是1

shrink: 1 空间不够时，我可以缩，缩得也按比例

basis: 0 起始大小是 0（也就是不预留空间）
