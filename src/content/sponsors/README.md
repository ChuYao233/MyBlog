# 赞赏者添加说明

要添加赞赏者，只需在此目录下创建一个新的 YAML 文件即可。

## YAML 文件格式

文件名可以是任意名称（建议使用赞赏者名称的拼音或英文），例如：`example.yaml`

文件内容格式：

```yaml
name: 赞赏者名称
amount: 10（可选，赞赏金额）
date: "2024-01-01"（可选，赞赏日期，必须用引号包裹）
message: 感谢你的优质内容！（可选，留言）
avatar: https://example.com/avatar.jpg（可选，头像）
url: https://example.com（可选，个人网站链接）
```

## 必需字段

- `name`: 赞赏者名称

## 可选字段

- `amount`: 赞赏金额（数字）
- `date`: 赞赏日期（字符串，格式：YYYY-MM-DD）
- `message`: 留言内容
- `avatar`: 头像图片 URL
- `url`: 个人网站或链接

## 示例

参考 `example.yaml` 文件。

