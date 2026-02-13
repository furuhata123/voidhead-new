---
title: CSS Debug Handbook - Layout Essentials
date: 1998-01-01
tags: blog, Frontend
---
> 这是一个用来整理CSS布局系统核心知识的手册.
<!-- readmore -->
## 跳转目录

| 概念           | 能解决的问题                            |
| -------------- | ---------------------------------------- |
| [`box model`](#box-model---元素的边界定义)   | 判断元素为什么大小不对                  |
| [`position`](#position---不同的坐标系)     | 理解脱离文档流的行为（absolute/fixed） |
| [`display`](#display)      | 决定元素是否是块、内联、栅格、弹性盒     |
| [`flex/grid`](#flex)    | 布局系统，决定空间如何分配              |

## Box Model - 元素的边界定义
已经很熟悉的概念，chrome f12中的elements中有直观的画图演示。不熟悉的是其他属性对Box的影响。
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
没有position就不能使用z-index，设置了position（除了static），你就有资格开始叠叠乐。

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
absolute/fixed适用于精确控制位置（弹窗、提示框、工具栏）

relative适用于相对偏移但不打乱结构，比如按钮内文字偏左点. 对position: relative的元素设top/left，它会移动位置，但仍占原位置的空间(static就无效了)

sticky适用于滚动吸附，如头部导航固定、吸底操作栏（移动端）

| 遇到的痛点       | 可能的解法                             |
| ------------ | --------------------------------- |
| 宽度/高度没对齐     | `position`可能让它脱离流 → 它不会撑开父容器了    |
| “贴到哪里”不对     | 检查是否有最近的`position: relative`的祖先 |
| 被遮住/层级不对   | 没有设置`z-index`，或外层容器层级影响它          |


豆知识：position: sticky就像是“条件fixed”：

默认是relative

滚动到某个点时自动变成fixed
```css
.sticky-header {
  position: sticky;
  top: 0; /* 到这里不动了 */
}
```
## Display
核心问题：一个元素的显示方式是块状、内联，还是栅格 / 弹性布局容器？它能不能包住子元素？子元素的布局规则是什么？
| 值              | 作用                  | 典型用途                                |
| -------------- | ------------------- | ----------------------------------- |
| `block`        | 占据整行，可设宽高，自动换行      | `<div>, <section>, <p>, <h1>`        |
| `inline`       | 行内显示，不能设宽高，不换行          | `<span>`、文本装饰等                      |
| `inline-block` | 行内排布，但可设宽高,不换行          | 小按钮、icon等                          |
| `flex`         | 变成弹性布局容器，子元素可弹性分配空间 | 卡片容器、导航栏、对齐等                        |
| `grid`         | 变成网格布局容器，子元素可占格子    | 复杂的界面网格，比如画廊、控制面板                   |
| `none`         | 不显示，且从文档流中移除        | 暂时隐藏元素（但注意不同于 `visibility: hidden`，none的元素不占据位置，hidden的元素还会占据位置） |
### Quick Checklist
- [x] content（width 默认只计算 content 部分），`box-sizing` 默认是 `content-box`，要手动设为 `border-box` width才会包含padding和border
- [x] inline元素不支持设置`width` `height`（需要转为`inline-block`才生效）
- [x] margin collapse发生在垂直方向的`block`元素之间，当两个上下相邻的 block 元素之间都有margin-top/margin-bottom，它们不会“加起来”，而是合并成一个更大的值。

### 排查手册
为什么设置了width没效果？：是不是display: inline？

为什么两个按钮换行了？：可能是display: block或默认布局规则

为什么排不齐？：是不是需要改成flex或grid？
## Flex
用一句话总结：flex 是“空间分配器”。它能解决的是一类问题：“几个元素横着（或竖着）排，怎么让它们刚好排好、对齐、拉伸、靠边、等分、缩放？”
### 结构
在 Flex 世界里，有两个层次：

外层容器（flex container）加 display: flex

子元素（flex items）自动变成“能被分配空间的对象”

一个 flex 容器可以控制两个方向：
| 方向       | 属性名                                | 控制啥          |
| -------- | ---------------------------------- | ------------ |
| 主轴（横or竖） | `flex-direction`<br>`justify-content` | 控制子元素如何沿主轴排列 |
| 交叉轴      | `align-items`<br>`align-self`         | 控制子元素在副轴上的对齐 |

主轴默认为横向：row，所以justify控横，align控竖。
### flex: <flex-grow> <flex-shrink> <flex-basis>
1. flex-grow：有剩余空间时，谁多长一些？
```css
    flex-grow: 0; /* 不长 */
    flex-grow: 1; /*分到等量空间*/
    flex-grow: 2; /* 是别人的两倍 */
```
2. flex-shrink：空间不够时，谁先变小？
```css
    flex-shrink: 0; /* no shrinking */
    flex-shrink:1; /* shrink according to scale */
    flex-shrink: 2; /* can shrink more */
```
3. flex-basis：原始大小
```css
    flex-basis: 200px; /* require at least 200px width */
```
flex-basis会覆盖width

**所以flex: 1是**``flex: 1 1 0%``，等比例长大缩小，从0开始分配剩余空间
### 几个常见问题的flex解法模型
| 想要的效果          | 设置           |
| --------| -----------|
| 全部等宽           | `flex: 1`  |
| 固定左侧 + 自适右侧    | `.left {flex: 0 0 100px}`<br>`.right {flex: 1}` |
| 不让缩小           | `flex-shrink: 0`  |
| 固定宽度优先，空间大了再变大 | `flex: 1 1 200px`|

## Grid
与flex不同，grid有横竖两个主轴。
``grid-template-row/column``控制几行/几列；``gap``控制每个格子间距。

可以自定义比例：
```css
grid-template-columns: 1fr 2fr 1fr;
grid-template-columns: 100px auto 200px;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* auto fit */
```
子项跨格：
```css
grid-column: 1 / 3; /* takes up col 1-3 (3rd excluded) */
grid-area: 2 / 1 / 4 / 3; /* row-start / column-start / row-end / column-end */
```