function shift_page() {

// 教室・講師に応じてスケジュールテーブルの調整ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

// テーブルの行の色をステータスに応じて変更
const tableRows = document.querySelectorAll('#schedule-table tr:not(:first-child)');
tableRows.forEach(row => {
  const rowColorFlag = row.querySelector('td:nth-child(2)').textContent;
  if(newData["ページタイプ"] === "school"){
    switch(rowColorFlag){
      case "勤務可能": row.style["background-color"] = "#FFF2CC"; break;
      case "勤務不可": row.style["background-color"] = "#cccccc"; break;
    }
  }else if(newData["ページタイプ"] === "teacher"){
    switch(rowColorFlag){
      case "講師回答前": row.style["background-color"] = "#F4CCCC"; break;
      case "勤務不可": row.style["background-color"] = "#cccccc"; break;
    }
  }
});


// モーダルの挿入ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const modalTemplate=`
<div id="myModal" class="modal">
    <div class="modal-content form-container">
    </div>
</div>`;
document.getElementById("page-content").insertAdjacentHTML('beforeend', modalTemplate);
const modal = document.getElementById("myModal");

// 全てのrequestボタンにイベントリスナーを追加  
const btns = document.querySelectorAll("table button");
btns.forEach((button) => {
button.addEventListener("click", showModal);
});


// テーブルのボタンが押されたときに呼び出される関数ーーーーーーーーーーーーーーーーーーーーー
function showModal(event) {

  const button = event.target;
  const row = button.closest("tr");

  // 各列の値を取得
  const date = row.cells[0].innerText;
  const availability = row.cells[1].innerText;
  const availableTime = row.cells[2].innerText;
  const remarks = row.cells[3].innerText;
  const requestStatus = row.cells[4].innerText;
  let formTitle, formInfo, formGuide, formButton,schoolId,schoolName,teacherId,teacherName
  let submitNone, requestNone, changeNone, answerNone

  // フォームの内容を設定
  if (button.classList.contains("submit")) {
    // フォーム設定
    formTitle = `${date}｜スケジュール提出`
    formInfo = "提出中のスケジュール"
    formGuide = "↓ ｽｹｼﾞｭｰﾙをご記入ください"
    formButton = "ｽｹｼﾞｭｰﾙを提出する"
    requestNone = `style="display:none;"`
  } else if (button.classList.contains("request")) {
    // フォーム設定
    formTitle = `${date}｜${page_call_property["講師名"]}先生｜シフト依頼`
    formInfo = "講師の提出スケジュール"
    formGuide = "↓ 依頼内容をご記入ください"
    formButton = "シフトを依頼する"
    requestNone = `style="display:none;"`
  } else if (button.classList.contains("change")) {
    // フォーム設定
    formTitle = `${date}｜${page_call_property["講師名"]}先生｜依頼修正`
    formInfo = "依頼中のシフト内容"
    formGuide = "↓ 依頼内容をご記入ください"
    formButton = "シフトを修正する"
    requestNone = `style="display:none;"`
  } else if (button.classList.contains("answer")) {
    // フォーム設定
    formTitle = `${date}｜${page_call_property["教室名"]}｜依頼回答`
    formInfo = "教室からの依頼内容"
    formGuide = "↓ 回答内容をご記入ください"
    formButton = "回答を提出する"
    requestNone = `style="display:none;"`
  }
  // データ内容を設定
  if(newData["ページタイプ"] === "school"){
    schoolId = newData["教室ID"]
    schoolName = newData["教室名"]
    teacherId = page_call_property["会員ID"]
    teacherName = page_call_property["会員ID"]
  }else if(newData["ページタイプ"] === "teacher"){
    schoolId = page_call_property["教室ID"]
    schoolName = page_call_property["教室名"]
    teacherId = newData["会員ID"]
    teacherName = newData["会員ID"]
  }


  const formElements = [
    // 隠しフォーム要素（事前定義済み）
    { name: "勤務日", type: "hidden", value: "${date}" },
    { name: "会員ID", type: "hidden", value: "${teacherId}" },
    { name: "講師名", type: "hidden", value: "${teacherName}" },
    { name: "教室ID", type: "hidden", value: "${schoolId}" },
    { name: "教室名", type: "hidden", value: "${schoolName}" },
    // ここからがフォーム回答要素
    { name: "勤務可否", type: "select", value: "", inline: true, width: "200px", options: [
      { value: "", text: "選択してください" },
      { value: "勤務可能", text: "勤務可能" },
      { value: "勤務不可", text: "勤務不可" },
      { value: "調整中", text: "調整中" },
    ]},
    { name: "講師回答", type: "select", value: "", inline: true, width: "200px", options: [
      { value: "", text: "選択してください" },
      { value: "勤務可能", text: "勤務可能" },
      { value: "勤務不可", text: "勤務不可" },
      { value: "調整中", text: "調整中" },
    ]},
    { name: "勤務開始時間", type: "time", value: "", inline: true },
    { name: "勤務終了時間", type: "time", value: "", inline: true },
    { name: "休憩時間", type: "number", value: "", inline: true },
    { name: "補足・備考", type: "textarea", value: "", inline: false },
  ];
  







  const formContainer = document.querySelector(".modal-content.form-container");
  const formContent = `
    <span class="close closeButton">&times;</span>
    <h3>${formTitle}</h3>
    <div id="submit-schedule">
      <h4>${formInfo}</h4>
      <ul>
      <li>スケジュール｜${availability}</li>
      <li>勤務可能時間｜${availableTime}</li>
      <li>補足・備考　｜${remarks}</li>
      </ul>
    </div>
    <!-- 各種フォーム本体 -->
    <h4>${formGuide}</h4>
    <form id="myForm" class="form-content">
      <input type="hidden" name="勤務日" value="${date}">
      <input type="hidden" name="会員ID" value="${teacherId}">
      <input type="hidden" name="講師名" value="${teacherName}">
      <input type="hidden" name="教室ID" value="${schoolId}">
      <input type="hidden" name="教室名" value="${schoolName}">
      <!-- 勤務可否 -->
      <div class="form-row" ${requestNone}>
      <div class="form-inline" >
      <label for="start_hour">勤務可否</label>
      <select id="status" name="status">
      <option value="">選択してください</option>
      <option value="勤務可能">勤務可能</option>
      <option value="勤務不可">勤務不可</option>
      <option value="調整中">調整中</option>
      </select>
      </div>
      </div>
      <!-- 講師回答 -->
      <div class="form-row" ${requestNone}>
      <div class="form-inline" >
      <label for="start_hour">勤務可否</label>
      <select id="status" name="status">
      <option value="">選択してください</option>
      <option value="勤務可能">勤務可能</option>
      <option value="勤務不可">勤務不可</option>
      <option value="調整中">調整中</option>
      </select>
      </div>
      </div>
      <!-- 勤務開始時間 -->
      <div class="form-row">
          <label for="start_hour">勤務開始時間</label>
          <div class="form-inline">
              <select id="start_hour" name="start_hour">
              <!-- 8:00 ~ 22:00 の選択肢を生成 -->
              <option value="">--</option>
              </select>
              <label for="start_minute">時</label>
              <select id="start_minute" name="start_minute">
              <option value="">--</option>
              </select>分
          </div>
      </div>
      <!-- 勤務終了時間 -->
      <div class="form-row">
          <label for="end_hour">勤務終了時間</label>
          <div class="form-inline">
              <select id="end_hour" name="end_hour">
              <!-- 8:00 ~ 22:00 の選択肢を生成 -->
              <option value="">--</option>
              </select>
              <label for="end_minute">時</label>
              <select id="end_minute" name="end_minute">
              <option value="">--</option>
              </select>分
          </div>
      </div>
      <!-- 休憩時間 -->
      <div class="form-row" ${submitNone}>
          <label for="break_time">休憩時間</label>
          <div class="form-inline">
              <select id="break_time" name="break_time">
              <option value="">--</option>
              </select>分
          </div>
      </div>
      <!-- 補足・備考 -->
      <div class="form-row">
          <label for="remarks">・補足・備考</label>
          <textarea id="remarks" name="remarks"></textarea>
      </div>
      <!-- 送信ボタン・取り消しボタン -->
      <div class="form-row buttons">
          <button type="submit">${formButton}</button>
          <button type="submit" id="cancelButton" style="display: none;">シフト依頼を取消する</button>
      </div>
    </form>
  `;

  formContainer.innerHTML = formContent;



  // 勤務時間のオプションを設定するーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // 勤務開始時間 (時)
  const startHour = document.getElementById('start_hour');
  addOptions(startHour, 8, 22, 1);
  // 勤務開始時間 (分)
  const startMinute = document.getElementById('start_minute');
  addOptions(startMinute, 0, 50, 10);
  // 勤務終了時間 (時)
  const endHour = document.getElementById('end_hour');
  addOptions(endHour, 8, 22, 1);
  // 勤務終了時間 (分)
  const endMinute = document.getElementById('end_minute');
  addOptions(endMinute, 0, 50, 10);
  // 休憩時間
  const breakTime = document.getElementById('break_time');
  addOptions(breakTime, 0, 120, 10);


  // 依頼状況に応じてモーダルの依頼取り消しボタンを制御  
  const cancelButton = document.getElementById("cancelButton");
  if (requestStatus === "依頼修正") {
      cancelButton.style.display ="block";
  } else if (requestStatus === "新規依頼") {
      cancelButton.style.display ="none";
  }

  // モーダルを表示＆クローズボタンの設定
  modal.style.display = "block";
  const closeButton = document.getElementsByClassName("close")[0];
  closeButton.onclick = () => {
    modal.style.display = "none";
  };
}

// オプション追加用の関数
function addOptions(selectElement, start, end, step) {
  for (let i = start; i <= end; i += step) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      selectElement.appendChild(option);
  }
}

// span.onclick = closeModal;
window.onclick = function(event) {
if (event.target == modal) {
  closeModal();
}
}





// フォームの送信をハンドルする関数
const handleSubmit = async (event) => {
  event.preventDefault(); // デフォルトの送信をキャンセル
  const form = document.querySelector('#myForm');
  const formData = new FormData(form);
  const data = {};
  // FormDataオブジェクトから連想配列に変換
  for (const [key, value] of formData.entries()) {
      data[key] = value;
  }
  // 講師ID、応募ID
  data["応募ID"] = teacherId;
  data["会員ID"] = ouboId;
  data["教室ID"] = newData["教室ID"];
  data["教室名"] = newData("教室名");

  // 勤務開始時間、終了時間、休憩時間をdataに追加
  data["勤務開始時間"] = data["start_hour"] + ':' + (data["start_minute"] === '0' ? '00' : data["start_minute"]);
  data["勤務終了時間"] = data["end_hour"] + ':' + (data["end_minute"] === '0' ? '00' : data["end_minute"]);
  data["休憩時間"] = data["break_time"];

  // 日本時間のタイムスタンプを追加
  data["submitted_timestamp"] = new Date().toLocaleString("ja-JP");

  // 勤務日を取得
  data["work_date"] = workDate;

  // 依頼取り消しを追加
  data["request_cancellation"] = false;
  // 補足・備考のテキストに追記
  data["remarks"] = "シフト依頼時[from:教室]\n" + data["remarks"];
  console.log(data);
  const response = await fetch("https://script.google.com/macros/s/AKfycbwWfeARqEk-kQyWqXYMmnVuVmgTzE4fhe8tK425-9a5NC6UQ52K_44h0W2d-e3Egx4T/exec", {
      method: 'POST',
      headers: {
      'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data),
      mode: 'cors', //CORS対応
  });

  const text = await response.text();
  if (text.includes("Success")) {
      console.log('データが正常に送信されました');
      form.reset(); // フォームの入力値をリセット
  } else {
      console.error(`エラーメッセージ: ${text}`);
  }
};
const form = document.querySelector('#myForm');

// 依頼取り消しの操作
function handleRequestCancellation() {
  if (confirm("本当に依頼を取り消しますか？")) {
    const data = {
      "依頼取り消し": true,
      "work_date": workDate
    };
    console.log(data);

    // POSTリクエストを送信
    (async () => {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwWfeARqEk-kQyWqXYMmnVuVmgTzE4fhe8tK425-9a5NC6UQ52K_44h0W2d-e3Egx4T/exec", {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
        mode: 'cors',
      });

      const text = await response.text();
      if (text.includes("Success")) {
        console.log('データが正常に送信されました');
        form.reset(); // フォームの入力値をリセット
      } else {
        console.error(`エラーメッセージ: ${text}`);
      }
    })();

    closeModal();
  }
}
const cancelButton = document.getElementById("cancelButton");
//   cancelButton.addEventListener('click', handleRequestCancellation);

};