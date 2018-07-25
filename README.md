# react-validator

專案中的validator.js是參考[jquery-validation](https://github.com/jquery-validation/jquery-validation)的結構來設計，讓我們可以在每個index.js中引用，加速程式開發，而且能更方便管理驗證程序。

# ***How*** to use Validator

## 宣告Validator，並制定規範

先引用

```javascript
import Validator from 'utils/validator';
```

在constructor中建立validator，填上我們的規範，客製化的error message以及error message該回傳到哪個state欄位，好讓errorText可以完整呈現。
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
### Rules列表
| 規則  | 該填的值 | 意義  |
|---|---|---|
| errorState  | state名稱，以字串方式填入  | ***errorState是必填***，將state名稱填進去，有錯誤訊息會自動傳入指定的state中  |
| required  | true / false  | 代表該欄位是必填欄位，如果沒有required屬性或required屬性為false，代表該欄位是選填，可以不填資料，但如果填了就必須符合其他rule  |
| email  | true  | 須符合email格式  |
| url  | true  | 須符合url格式 |
| equalTo  | state名稱，以字串方式填入  | 必須跟指定的欄位值相同，通常使用在密碼二次驗證  |
| minLength  | 整數  | 最小長度限制，輸入欄位是字串或陣列 |
| maxLength  | 整數  | 最大長度限制，輸入欄位是字串或陣列  |
| rangeLength  | [ 整數, 整數 ]  | 長度區間限制，輸入欄位是字串或陣列  |
| min  | 數字  | 數字最小值限制，輸入欄位是數字 |
| max  | 數字  | 數字最大值限制，輸入欄位是數字  |
| range | [ 數字, 數字 ]  | 數字大小區間限制，輸入欄位是數字  |
| integer  | true  | 必須是整數  |
| phone  | true  | 須符合電話號碼格式  |
| or  | JSON Object | or中可已填入別的rule規範，只要其中一項符合即可通過驗證 |
| uuid  | true  | 須符合uuid格式  |
| pattern  | 正規表示式，如 /\^[0-9]+$/ | 須符合自訂的正規表示式格式 |
| depend  | state名稱，以字串方式填入  | 當指定的欄位為true時才需驗證，false的時候就不用驗證  |

## 進行驗證

關於驗證，一共有3個function可以使用，如下

 * `validate()` - 直接驗證，並將欄位標記active
 * `validateWhenActive()` - 確認該欄位是active的時候，才會進行驗證
 * `activateValidator()` - 如果欄位從未被填寫過，同時有填入資料時，將欄位標記active，接著進行驗證

### 什麼是active？

active代表開啟驗證模式，因為在欄位的onChange事件上，使用者第一次填表時不需要馬上驗證，會讓使用者體驗不佳，在使用者onBlur欄位後再進行驗證就好，當第一次驗證後，就將active設為true表示開啟，代表使用者已經填寫過欄位了，之後要修改欄位的時候需要onChange時就立即驗證，當按下送出表單時，同時驗證所有欄位並且將欄位的active都設為true，這樣一來有錯誤的欄位時就能即時驗證了，搭配另一篇[UI/UX 設計指南分享](https://hackmd.io/ot2fbVq5RZmECTUGZdD_Pw)更能夠了解這個流程的緣由。


### 各個function的使用情境
* `validate()` - 通常用在 **「送出」** 按鈕上，送出時一定會驗證該欄位，而且在驗證後，驗證的欄位如果有錯通常都要馬上修正，所以`validate()`也會將驗證欄位的active通通設為true。

* `validateWhenActive()` - 通常用在onChange事件，當欄位真的被驗證過後才需要立即驗證，所以如果套用`validate()`的話，在你剛輸入資料時，欄位可能會馬上跳出您的輸入格式不正確等字樣，所以除非是複雜的驗證機制，不然對使用者比較友善的方式是使用`validateWhenActive()`，他會檢查該欄位的active是否為true，是的話才會驗證。

* `activateValidator()` - 通常用在onBlur事件，當欄位被填寫後，游標離開該欄位的時候，將欄位的active設為true，並且馬上驗證，但其中的特例是，如果使用者跳離欄位時，欄位是空值，代表使用者還不打算填寫該欄位，這個時候就不會去觸發上述的事件了。

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


## 該帶入什麼參數來使用`validate()`等function呢

因為3個function帶入參數的規格是一樣的，所以這邊以`validate()`為例。

validate()即是拿來驗證的function，我們使用下方建立的驗證規則進行驗證，在`new Validator()`中第一個填入的參數是整個component，因為validator會使用this.state，所以必須傳入this，第二個參數就是驗證規範的rules與messages。
```javascript
this.validator = new Validator(this, {
  rules: {
    name: { required: true, errorState: 'nameError' },
    web: { required: true, url: true, errorState: 'webError' },
    account: { 
        required: true,
        or :{
            phone: true,
            email: true,
        },
        errorState: 'webError'
    },
  },
  messages: {
    name: { required: 'You need to enter your name.' },
  },
});
```

validate()使用時如果沒帶入參數，那就會驗證validator中所有的規則。

```javascript
const errors = this.validator.validate();
```
也能帶入參數指定要驗證哪一些欄位。
```javascript
const errors = this.validator.validate('name');
const otherErrors = this.validator.validate('name','web');
```

如果沒有錯誤的話會回傳null，有錯誤的話則會回傳哪個欄位的哪個規則錯誤，假如說name的欄位留空，而web欄位輸入`ThisIsTest`，account輸入`test@gmail.com`，然後執行`this.validator.validate();`，回傳的errors格式如下：

```json
{
    name: "required",
    web: "url",
}
```
這代表我們只要用errors來判斷是否要繼續執行程式
```javascript
const errors = this.validator.validate();
if (errors) return;
```

另外，假如說一個欄位中有多個rule，那在驗證時，會從最左邊的rule先驗證，只要一有error就會return，不會繼續驗證下一個rule，下方的rule中，只要欄位是空的，error就會是`{ web: "required"}`，不會繼續檢查是否符合url。其中`depend`與`errorState`不會受到順序影響
```json
rules: {
    web: { required: true, url: true, errorState: 'webError' },
}
```

每個rule都有對應一個預設的message，message能對應i18n模組(尚未開發)，所以可以不填message，如果想客製化message就在`messages`中對應的欄位與規則上填入error message，如下：

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

## 使用setConfig()切換rules與messages

有時候會在validator已經宣告後的某些狀況下更改驗證規則，這時候可以使用setConfig()，填入的rules與messages格式跟宣告時一樣，唯一要注意的是如果想要刪除某個rule或message，就帶入同樣的欄位並在值的地方填上`"delete"`，就可以移除該欄位。

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
