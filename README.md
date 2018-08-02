# react-happy-validator

**_[ English verision README is coming soon~ ]_**

You can check this project on [github](https://github.com/Hsueh-Jen/react-happy-validator)

You can check live demo [here](https://stackblitz.com/edit/react-happy-validator-sample)

專案中的 index.js 是參考[jquery-validation](https://github.com/jquery-validation/jquery-validation)的結構來設計，讓我們可以在每個 index.js 中引用，加速程式開發，而且能更方便管理驗證程序。

# **_How_** to use Validator

## 宣告 Validator，並制定規範

先引用

```javascript
import Validator from 'react-happy-validator';
```

在 constructor 中建立 validator，填上我們的規範，客製化的 error message 以及 error message 該回傳到哪個 state 欄位，好讓 errorText 可以完整呈現。

```javascript
// 宣告Validator並且填入rules與messages
this.validator = new Validator(this, {
  rules: {
    name: { required: true, errorState: 'nameError' },
    web: { required: true, url: true, errorState: 'webError' },
  },
  messages: {
    name: { required: 'You need to enter your name.' },
});
```

### Rules 列表

| 規則        | 該填的值                   | 意義                                                                                                                                |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| errorState  | state 名稱，以字串方式填入 | **_errorState 是必填_**，將 state 名稱填進去，有錯誤訊息會自動傳入指定的 state 中                                                   |
| required    | true / false               | 代表該欄位是必填欄位，如果沒有 required 屬性或 required 屬性為 false，代表該欄位是選填，可以不填資料，但如果填了就必須符合其他 rule |
| email       | true                       | 須符合 email 格式                                                                                                                   |
| url         | true                       | 須符合 url 格式                                                                                                                     |
| equalTo     | state 名稱，以字串方式填入 | 必須跟指定的欄位值相同，通常使用在密碼二次驗證                                                                                      |
| minLength   | 整數                       | 最小長度限制，輸入欄位是字串或陣列                                                                                                  |
| maxLength   | 整數                       | 最大長度限制，輸入欄位是字串或陣列                                                                                                  |
| rangeLength | [ 整數, 整數 ]             | 長度區間限制，輸入欄位是字串或陣列                                                                                                  |
| min         | 數字                       | 數字最小值限制，輸入欄位是數字                                                                                                      |
| max         | 數字                       | 數字最大值限制，輸入欄位是數字                                                                                                      |
| range       | [ 數字, 數字 ]             | 數字大小區間限制，輸入欄位是數字                                                                                                    |
| minDate     | state 名稱 / Date()        | 日期最小值限制，可以輸入 state 名稱或直接輸入 Date 行型態的資料                                                                     |
| maxDate     | state 名稱 / Date()        | 日期最大值限制，可以輸入 state 名稱或直接輸入 Date 行型態的資料                                                                     |
| integer     | true                       | 必須是整數                                                                                                                          |
| phone       | true                       | 須符合電話號碼格式                                                                                                                  |
| or          | JSON Object                | or 中可已填入別的 rule 規範，只要其中一項符合即可通過驗證                                                                           |
| uuid        | true                       | 須符合 uuid 格式                                                                                                                    |
| pattern     | 正規表示式，如 /\^[0-9]+$/ | 須符合自訂的正規表示式格式                                                                                                          |
| depend      | state 名稱，以字串方式填入 | 當指定的欄位為 true 時才需驗證，false 的時候就不用驗證                                                                              |

## 進行驗證

關於驗證，一共有 3 個 function 可以使用，如下

- `validate()` - 直接驗證，並將欄位標記 active
- `validateWhenActive()` - 確認該欄位是 active 的時候，才會進行驗證
- `activateValidator()` - 如果欄位從未被填寫過，同時有填入資料時，將欄位標記 active，接著進行驗證

### 什麼是 active？

active 代表開啟驗證模式，因為在欄位的 onChange 事件上，使用者第一次填表時不需要馬上驗證，會讓使用者體驗不佳，在使用者 onBlur 欄位後再進行驗證就好，當第一次驗證後，就將 active 設為 true 表示開啟，代表使用者已經填寫過欄位了，之後要修改欄位的時候需要 onChange 時就立即驗證，當按下送出表單時，同時驗證所有欄位並且將欄位的 active 都設為 true，這樣一來有錯誤的欄位時就能即時驗證了，搭配另一篇[UI/UX 設計指南分享](https://hackmd.io/ot2fbVq5RZmECTUGZdD_Pw)更能夠了解這個流程的緣由。

### 各個 function 的使用情境

- `validate()` - 通常用在 **「送出」** 按鈕上，送出時一定會驗證該欄位，而且在驗證後，驗證的欄位如果有錯通常都要馬上修正，所以`validate()`也會將驗證欄位的 active 通通設為 true。

- `validateWhenActive()` - 通常用在 onChange 事件，當欄位真的被驗證過後才需要立即驗證，所以如果套用`validate()`的話，在你剛輸入資料時，欄位可能會馬上跳出您的輸入格式不正確等字樣，所以除非是複雜的驗證機制，不然對使用者比較友善的方式是使用`validateWhenActive()`，他會檢查該欄位的 active 是否為 true，是的話才會驗證。

- `activateValidator()` - 通常用在 onBlur 事件，當欄位被填寫後，游標離開該欄位的時候，將欄位的 active 設為 true，並且馬上驗證，但其中的特例是，如果使用者跳離欄位時，欄位是空值，代表使用者還不打算填寫該欄位，這個時候就不會去觸發上述的事件了。

使用情境大致如下：

```jsx
<TextField
    value={this.state.nickname}
    onChange={() => { this.validator.validateWhenActive('nickname'); }}
    onBlur={() => { this.validator.activateValidator('nickname'); }}
/>

<RaisedButton
    label="Submit"
    onClick={() =>this.validator.validate('nickname'); }}
/>
```

## 該帶入什麼參數來使用`validate()`等 function 呢

因為 3 個 function 帶入參數的規格是一樣的，所以這邊以`validate()`為例。

validate()即是拿來驗證的 function，我們使用下方建立的驗證規則進行驗證，在`new Validator()`中第一個填入的參數是整個 component，因為 validator 會使用 this.state，所以必須傳入 this，第二個參數就是驗證規範的 rules 與 messages。

```javascript
this.validator = new Validator(this, {
  rules: {
    name: { required: true, errorState: 'nameError' },
    web: { required: true, url: true, errorState: 'webError' },
    account: {
      required: true,
      or: {
        phone: true,
        email: true,
      },
      errorState: 'webError',
    },
  },
  messages: {
    name: { required: 'You need to enter your name.' },
  },
});
```

validate()使用時如果沒帶入參數，那就會驗證 validator 中所有的規則。

```javascript
const errors = this.validator.validate();
```

也能帶入參數指定要驗證哪一些欄位。

```javascript
const errors = this.validator.validate('name');
const otherErrors = this.validator.validate('name', 'web');
```

如果沒有錯誤的話會回傳 null，有錯誤的話則會回傳哪個欄位的哪個規則錯誤，假如說 name 的欄位留空，而 web 欄位輸入`ThisIsTest`，account 輸入`test@gmail.com`，然後執行`this.validator.validate();`，回傳的 errors 格式如下：

```json
{
  "name": "required",
  "web": "url"
}
```

這代表我們只要用 errors 來判斷是否要繼續執行程式

```javascript
const errors = this.validator.validate();
if (errors) return;
```

另外，假如說一個欄位中有多個 rule，那在驗證時，會從最左邊的 rule 先驗證，只要一有 error 就會 return，不會繼續驗證下一個 rule，下方的 rule 中，只要欄位是空的，error 就會是`{ web: "required"}`，不會繼續檢查是否符合 url。其中`depend`與`errorState`不會受到順序影響

```json
rules: {
    web: { required: true, url: true, errorState: 'webError' },
}
```

每個 rule 都有對應一個預設的 message，message 能對應 i18n 模組(尚未開發)，所以可以不填 message，如果想客製化 message 就在`messages`中對應的欄位與規則上填入 error message，如下：

```javascript
this.validator = new Validator(this, {
  rules: {
    web: { required: true, url: true, errorState: 'webError' },
  },
  messages: {
    web: { required: 'You need to enter your name.' },
  },
});
```

## 使用 setConfig()切換 rules 與 messages

有時候會在 validator 已經宣告後的某些狀況下更改驗證規則，這時候可以使用 setConfig()，填入的 rules 與 messages 格式跟宣告時一樣，唯一要注意的是如果想要刪除某個 rule 或 message，就帶入同樣的欄位並在值的地方填上`"delete"`，就可以移除該欄位。

使用範例如下：

```javascript
this.validator.setConfig({
    rules: {
        web: {
            url: 'delete'
            minLength: 10,
        },
    },
});
```
