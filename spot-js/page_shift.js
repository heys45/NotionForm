function shift_page() {

// テーブルの見た目調整ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const tableRows = document.querySelectorAll('#schedule-table tbody tr:not(:first-child)');
tableRows.forEach(row => {
  const availabilityCell = row.querySelector('td:nth-child(2)');
  const requestStatusCell = row.querySelector('td:nth-child(5)');

  // 勤務可否列の変更
  switch (availabilityCell.textContent) {
    case '勤務不可':
      availabilityCell.innerHTML = '<button class="unavailable">勤務不可</button>';
      break;
    case '調整中':
      availabilityCell.innerHTML = '<button class="adjusting">調整中</button>';
      break;
    case '講師回答前':
      availabilityCell.innerHTML = '<button class="adjusting">未提出</button>';
      break;
    case '一部勤務可能':
      availabilityCell.innerHTML = '<button class="partially-available">勤務可能</button>';
      break;
    case '終日勤務可能':
      availabilityCell.innerHTML = '<button class="available">勤務可能</button>';
      break;
  }

  // 依頼状況列の変更
  if (availabilityCell.textContent === '勤務不可') {
    requestStatusCell.innerHTML = '<button class="request-not-possible">依頼不可</button>';
  } else if (requestStatusCell.textContent === '勤務確定') {
    requestStatusCell.innerHTML = '<button class="confirmed">勤務確定</button>';
  } else if (requestStatusCell.textContent === '講師回答前' || requestStatusCell.textContent === '調整希望') {
    requestStatusCell.innerHTML = '<button class="modify">依頼修正</button>';
  } else {
    requestStatusCell.innerHTML = '<button class="request">新規依頼</button>';
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
const btns = document.querySelectorAll(".request");
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

  // ページごとにフォームの内容を変更

  let requestnone ="";
  let schedulenone ="";
  if(newData["ページタイプ"] === "school"){
    const formTitle = "${workDate}｜"+page_call_property["講師名"]+"先生｜シフト依頼フォーム"
    const formInfo = "講師の提出スケジュール"
    const formGuide = "↓ 依頼内容をご記入ください"
    const formButton = "シフトを依頼する"
    requestnone = `style="display:none;"`
  } else if(newData["ページタイプ"] === "teacher"){
    const formTitle = "${workDate}｜"+"スケジュール提出フォーム"
    const formInfo = "提出中のスケジュール"
    const formGuide = "↓ 勤務可能時間をご記入ください"
    const formButton = "スケジュールを提出"
    schedulenone = `style="display:none;"`
  }

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
    <input type="hidden" name="working_day" value="${date}">
    <input type="hidden" name="teacher_name" value="${teacher}">
    <input type="hidden" name="classroom_name" value="教室名">
    <input type="hidden" name="old_remarks" value="${remarks}">
    <input type="hidden" name="attendance_status" value="${statusValue}">
        <!-- 勤務開始時間 -->
        <div class="form-row">
          <div class="form-inline" ${requestnone}>
              <label for="start_hour">勤務可否</label>
              <select id="status" name="status">
              <option value="">選択してください</option>
              <option value="勤務可能">勤務可能</option>
              <option value="勤務不可">勤務不可</option>
              <option value="調整中">調整中</option>
              </select>
          </div>
      </div>
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
        <div class="form-row" ${schedulenone}>
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