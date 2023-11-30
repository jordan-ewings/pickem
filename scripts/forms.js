

function prepareForm(e) {
  console.log(e.target);

  let modal = document.getElementById('modalFormContainer');
  let modalFormGames = document.getElementById('modalFormGames');
  let modalForm = document.getElementById('modalForm');
  let modalFooter = document.getElementById('modalForm').querySelector('.modal-footer');
  if (!modalFooter.classList.contains('d-none')) {
    modalFooter.classList.add('d-none');
  }

  let playerSelect = modal.querySelector('#player');

  let playerValue = playerSelect.value;
  let f_playerSet = playerSelect.value != 'Player';
  let f_pickitem = e.target.parentElement.classList.contains('pickitem');
  if (f_pickitem) {
    let pickitem = e.target.parentElement;
    playerValue = pickitem.getAttribute('data-player');
    playerSelect.value = playerValue;

    // store week number in modalForm
    let weekDiv = pickitem.closest('.week-games');
    let weekNum = weekDiv.getAttribute('id').replace('week-games-', '');
    modalForm.setAttribute('data-week', weekNum);
  }


  // identify week-games div that is being displayed (all others have class hide)
  let weekNum = modalForm.getAttribute('data-week');
  let tblrows = document.getElementById('week-games-' + weekNum).querySelectorAll('.tblrow');
  modalFormGames.innerHTML = '';
  let openGames = tblrows.length;
  let pickedGames = 0;

  tblrows.forEach((tblrow) => {

    let teamSelectValue = '';
    let pickFormatting = [];
    let pickitem = tblrow.querySelector('.pickitem[data-player="' + playerValue + '"]');
    // if (pickitem) {
    let is_faded = pickitem.querySelector('span').classList.contains('opacity-25');
    let status = pickitem.querySelector('span').getAttribute('data-status');
    teamSelectValue = pickitem.getAttribute('data-pick-teamfull');

    if (tblrow.classList.contains('game-post')) {
      if (is_faded) {
        pickFormatting = ['border-danger'];
      } else {
        pickFormatting = ['border-success'];
      }
    }

    let entryForm = pickitem.getAttribute('data-form-title');
    let entryAction = pickitem.getAttribute('data-url').replace('/viewform', '/formResponse');
    let entryPlayer = pickitem.getAttribute('data-field-player');
    let entryID = pickitem.getAttribute('data-field-game');

    let gamerow = tblrow.querySelector('.gamerow');
    let gameid = gamerow.getAttribute('data-gameid');
    let gametime_raw = gamerow.getAttribute('data-gametime');
    let gametime = new Date(gametime_raw);
    let currtime = new Date();
    let time_diff = (currtime - gametime) / 1000 / 60;
    let is_open = time_diff < 5;
    if (!is_open) openGames--;

    // wrap each team in a radio button input
    modalFormGames.appendChild(gamerow.cloneNode(true));
    let game = modalFormGames.querySelector('.gamerow[data-gameid="' + gameid + '"]');

    game.classList.add('rounded-end-3', 'mb-3', 'bg-main', 'pb-2', 'ps-1');
    game.style.borderTop = 'none';
    game.style.borderLeft = '3px solid #0e0e0e';
    game.classList.add(...pickFormatting);
    game.setAttribute('data-picked', 'false')
    if (teamSelectValue != '') game.setAttribute('data-picked', 'true');

    let timeRemainingDiv = document.createElement('div');
    timeRemainingDiv.classList.add('dl-clock');
    timeRemainingDiv.classList.add('d-flex', 'flex-row', 'flex-nowrap', 'justify-content-start', 'text-smaller');
    if (is_open) timeRemainingDiv.classList.add('mt-2');
    timeRemainingDiv.setAttribute('data-deadline', gametime_raw);
    game.querySelector('.col-9').appendChild(timeRemainingDiv);

    if (status == 'LATE') {
      let late = document.createElement('div');
      late.classList.add('rounded-pill', 'text-center', 'text-smaller');
      late.classList.add('bg-danger', 'text-white');
      late.textContent = 'LATE';
      late.classList.add('mt-2', 'ms-auto', 'me-1');
      game.querySelector('.col-3').appendChild(late);
    }

    let teams = game.querySelectorAll('.teamrow');

    teams.forEach((team) => {
      let tempDiv = document.createElement('div');
      let teamName = team.getAttribute('data-teamfull');
      let teamId = teamName.split(' ').join('-');

      // make label from teamrow
      let label = document.createElement('label');
      label.classList.add('btn', 'btn-sm', 'd-flex', 'align-items-center');
      label.setAttribute('for', teamId);
      label.innerHTML = team.innerHTML;

      // convert teamrow to input
      let input = document.createElement('input');
      input.classList.add('btn-check');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', gameid);
      input.setAttribute('id', teamId);
      input.setAttribute('value', teamName);
      input.setAttribute('data-namealt-game', entryID);
      input.setAttribute('data-form-action', entryAction);
      input.setAttribute('data-form-title', entryForm);
      input.setAttribute('data-namealt-player', entryPlayer);

      // if teamSelectValue matches teamName, check the input
      if (teamSelectValue == teamName) {
        input.setAttribute('checked', '');
        input.setAttribute('data-origchecked', 'true');
        pickedGames++;
      } else {
        input.setAttribute('data-origchecked', 'false');
      }

      if (!is_open || FORMS_ENABLED == false) {
        input.setAttribute('disabled', '');
      }

      // if any input values change, show modal footer
      if (FORMS_ENABLED) {
        input.addEventListener('change', (e) => {

          let modal = document.getElementById('modalFormContainer');
          let form = modal.querySelector('#modalForm');
          let modalFooter = modal.querySelector('.modal-footer');
          let formInputs = form.querySelectorAll('input');

          let inputs_changed = false;
          formInputs.forEach((input) => {
            let gr = input.closest('.gamerow');
            if (input.checked && input.getAttribute('data-origchecked') == 'false') {
              inputs_changed = true;
              gr.classList.add('border-primary');
              // }
            } else {
              if (input.checked && input.getAttribute('data-origchecked') == 'true') {
                gr.classList.remove('border-primary');
              }
            }
          });
          if (inputs_changed == true) {
            if (modalFooter.classList.contains('d-none')) {
              modalFooter.classList.remove('d-none');
            }
          } else {
            if (modalFooter.classList.contains('d-none') == false) {
              modalFooter.classList.add('d-none');
            }
          }

        });
      }

      // append input to label
      tempDiv.appendChild(input);
      tempDiv.appendChild(label);

      team.replaceWith(tempDiv);

    });
  });

  let mHeader = document.getElementById('modalFormContainerLabel');
  let headtext = 'Week ' + weekNum;
  mHeader.innerHTML = '';
  mHeader.textContent = headtext;

  let mSub = document.getElementById('modalFormSubtitle');
  let subtext = openGames + ' game' + (openGames == 1 ? '' : 's') + ' available';
  let ttlGames = tblrows.length;
  if (ttlGames != pickedGames) subtext += ' (' + pickedGames + '/' + ttlGames + ' picked)';
  if (openGames == 0) subtext = 'Complete';
  mSub.textContent = subtext;

  updateTimeRemainingDivs();
  if (modal.hasAttribute('data-dlclocklistener') == false) {
    modal.setAttribute('data-dlclocklistener', '');
    modal.addEventListener('shown.bs.modal', (e) => {
      setInterval(updateTimeRemainingDivs, 5000);
    })
    modal.addEventListener('hidden.bs.modal', (e) => {
      clearInterval(updateTimeRemainingDivs);
    });
  }
}



function updateTimeRemainingDivs() {

  let dlClocks = document.querySelectorAll('.dl-clock');
  dlClocks.forEach((dlClock) => {
    let deadline = dlClock.getAttribute('data-deadline');
    let timeRemaining = calcTimeRemaining(deadline);
    dlClock.innerHTML = '';
    dlClock.appendChild(timeRemaining);
  });
}

function calcTimeRemaining(deadline) {

  let eLab = document.createDocumentFragment();

  let now = new Date();
  let start = new Date(deadline);
  if (now > start) {
    return;
    // let e = document.createElement('span');
    // e.classList.add('text-danger');
    // e.textContent = 'Game Started';
    // eLab.appendChild(e);
    // return eLab;
  }

  let rem = Math.abs(start - now) / (1000);
  let remD = Math.floor(rem / (60 * 60 * 24));
  let rem2 = rem - remD * 60 * 60 * 24;
  let remH = Math.floor(rem2 / (60 * 60));
  let rem3 = rem2 - remH * 60 * 60;
  let remM = Math.floor(rem3 / 60);
  let rem4 = rem3 - remM * 60;
  let remS = Math.floor(rem4);

  let vshow = {};
  let eColor = '';
  if (remD != 0) {
    vshow.M = 'd-none';
    vshow.S = 'd-none';
    eColor += 'text-dim';
  } else if (remD == 0 && remH != 0) {
    vshow.D = 'd-none';
    vshow.S = 'd-none';
    eColor += 'text-primary-emphasis';
  } else if (remD == 0 && remH == 0 && remM != 0) {
    vshow.D = 'd-none';
    vshow.H = 'd-none';
    eColor += 'text-danger-emphasis';
  } else if (remD == 0 && remH == 0 && remM == 0 && remS != 0) {
    vshow.D = 'd-none';
    vshow.H = 'd-none';
    vshow.M = 'd-none';
    eColor += 'text-danger';
  }

  let durClasses = ['text-smaller', 'opacity-75', 'fw-light'];
  let eSuffs = { 'D': 'DAY', 'H': 'HOUR', 'M': 'MIN', 'S': 'SEC' };
  let eVals = { 'D': remD, 'H': remH, 'M': remM, 'S': remS };
  ['D', 'H', 'M', 'S'].forEach((x) => {
    let e = document.createElement('div');
    e.classList.add(vshow[x]);
    e.classList.add(eColor);
    let eVal = document.createElement('span');
    eVal.classList.add('px-1');
    eVal.textContent = eVals[x].toString();
    let eSuff = document.createElement('span');
    eSuff.classList.add(...durClasses);
    eSuff.textContent = (eVals[x].toString() == 1) ? eSuffs[x] : eSuffs[x] + 'S';
    e.appendChild(eVal);
    e.appendChild(eSuff);
    eLab.appendChild(e);
  });

  return eLab;

}