# FamilyBudget API

Base URL
- IIS (example): `http://{host}/api`
- Local dev: `http://localhost:{port}`

Date formats
- Date: `YYYY-MM-DD`
- Month: `YYYY-MM`

## Expenses

GET `/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 描述: 取得指定日期區間內的支出清單。
- Response: `ExpenseDto[]`

POST `/expenses`
- 描述: 新增一筆支出。
- Body: `ExpenseCreateRequest`
- Response: `201 Created` with `ExpenseDto`

PUT `/expenses/{id}`
- 描述: 更新指定支出的內容。
- Body: `ExpenseUpdateRequest`
- Response: `200 OK` with `ExpenseDto`

DELETE `/expenses/{id}`
- 描述: 刪除指定支出。
- Response: `204 No Content`

ExpenseCreateRequest / ExpenseUpdateRequest
```
{
  "date": "2025-01-05",
  "memberId": "m_...",
  "categoryId": "c_...",
  "amount": 1500,
  "note": "optional"
}
```

ExpenseDto
```
{
  "id": "e_...",
  "date": "2025-01-05",
  "memberId": "m_...",
  "categoryId": "c_...",
  "amount": 1500,
  "note": "optional"
}
```

## Members

GET `/members`
- 描述: 取得所有成員。

POST `/members`
- 描述: 新增一位成員。
```
{
  "name": "Name",
  "monthlyContribution": 2000
}
```

PUT `/members/{id}`
- 描述: 更新指定成員的姓名與月存入金額。
```
{
  "name": "Name",
  "monthlyContribution": 2000
}
```

DELETE `/members/{id}`
- 描述: 刪除指定成員（若成員已有支出則會回傳衝突錯誤）。

## Categories

GET `/categories`
- 描述: 取得所有分類。

POST `/categories`
- 描述: 新增一個分類。
```
{
  "name": "Category"
}
```

PUT `/categories/{id}`
- 描述: 更新分類名稱或啟用狀態。
```
{
  "name": "Category",
  "isActive": true
}
```

DELETE `/categories/{id}`
- 描述: 刪除分類；若分類已被支出使用則會改為停用。
- Response body:
```
{
  "removed": true,
  "reason": null
}
```

## Analytics

GET `/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 描述: 取得指定日期區間內的分類彙總統計。

## Remittance

GET `/remittance?month=YYYY-MM`
- 描述: 取得指定月份的匯款建議金額。
