

async function handleFormSubmit(e) {
  e.preventDefault();

  // change submit button to show loading
  let submitBtn = e.target.querySelector('[type="submit"]');
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  submitBtn.setAttribute('disabled', '');


  let formData = new FormData(e.target);
  let player = formData.get('player');

  let keys = [...formData.keys()];
  keys.forEach((key) => {
    let input = e.target.querySelector('[name="' + key + '"]');
    if (input.name != 'player') {
      let checked = e.target.querySelector('[name="' + key + '"]:checked');
      if (checked) {
        let value = checked.value;
        formData.delete(key);

        formData.append(input.getAttribute('data-entryid'), value);
      } else {
        formData.delete(key);
      }
    } else {
      let value = input.value;
      formData.delete(key);
      formData.append(input.getAttribute('data-entryid'), value);
    }
  });

  console.log(formData);

  let formUrlRoot = e.target.getAttribute('data-entryurl').replace('/viewform', '/formResponse');
  let formUrlParams = new URLSearchParams(formData).toString();
  let formUrl = formUrlRoot + '?' + formUrlParams;
  console.log(formUrl);

  let requestOptions = {
    method: 'POST',
    redirect: 'follow'
  };

  await fetch(formUrl, requestOptions)
    .catch(error => console.log('error', error));

  // getSheet(X) where X = pickitem's data-form-title, check last row to confirm:
  // if last row's player is player, and if timestamp is within 10 seconds of now, then update picktime logos to reflect new picks (in pickrow divs)
  // if both conditions are not met, show modalMessage error to try again.


  // use formdata to update picktime logos to reflect new picks (in pickrow divs)
  let formDataObj = Object.fromEntries(formData.entries());
  let entryIds = Object.keys(formDataObj);
  entryIds.forEach((entryId) => {
    if (formDataObj[entryId] == player) return;
    // find pickitem with data-field-game == entryId and data-player == player
    let pickitem = document.querySelector('.pickitem[data-field-game="' + entryId + '"][data-player="' + player + '"]');
    // get logo src of formDataObj[entryId] team and set pickitem logo src to that
    let teamfull = formDataObj[entryId];
    let teamrow = document.querySelector('.teamrow[data-teamfull="' + teamfull + '"]');
    let logo = teamrow.querySelector('img').src;
    // if pickitem picture element is 'i' tag, replace with 'img' tag
    if (pickitem.querySelector('i')) {
      let img = document.createElement('img');
      img.src = logo;
      img.classList.add('object-fit-contain');
      img.style.height = '1.2rem';
      img.style.width = '1.2rem';
      pickitem.querySelector('i').replaceWith(img);
    } else {
      pickitem.querySelector('img').src = logo;
    }

    // update pickitem data attributes to reflect new pick
    pickitem.setAttribute('data-pick-teamfull', teamfull);

  });

  // hide modal footer buttons, show modal messages for 3, seconds, hide modal, remove 'd-none' from buttons to prepare for next time
  let modal = document.getElementById('modalFormContainer');
  let modalFooter = modal.querySelector('.modal-footer');
  // let buttons = modalFooter.querySelectorAll('button');
  // buttons.forEach((button) => {
  //   button.classList.add('d-none');
  // });
  // let msg = modal.querySelector('#modalMessage');
  // msg.classList.remove('d-none');
  // change submit button inner html to checkmark
  submitBtn.innerHTML = '<i class="fa-solid fa-check"></i>';

  setTimeout(() => {
    // msg.classList.add('d-none');
    modalFooter.classList.add('d-none');
    submitBtn.removeAttribute('disabled');
    submitBtn.innerHTML = 'Change Picks';
    // hide modal
    let modal = bootstrap.Modal.getInstance(document.getElementById('modalFormContainer'));
    modal.hide();

  }, 1000);

}

function prepareForm(e) {
  console.log(e.target);

  let form = document.getElementById('modalFormContainer');
  let formbody = document.getElementById('modalFormBody');
  let formGames = document.getElementById('modalFormGames');
  let modalFooter = document.getElementById('modalForm').querySelector('.modal-footer');
  if (!modalFooter.classList.contains('d-none')) {
    modalFooter.classList.add('d-none');
  }
  let playerSelect = form.querySelector('#player');
  if (playerSelect.hasAttribute('data-haslistener') == false) {
    playerSelect.setAttribute('data-haslistener', '');
    playerSelect.addEventListener('change', (e) => {
      prepareForm(e);
    });
  }

  let playerValue = playerSelect.value;
  let f_playerSet = playerSelect.value != 'Player';
  let f_pickitem = e.target.parentElement.classList.contains('pickitem');
  if (f_pickitem) {
    let pickitem = e.target.parentElement;
    playerValue = pickitem.getAttribute('data-player');
    playerSelect.value = playerValue;

    let entryId = pickitem.getAttribute('data-field-player');
    playerSelect.setAttribute('data-entryid', entryId);
    let entryURL = pickitem.getAttribute('data-url');
    document.getElementById('modalForm').setAttribute('data-entryurl', entryURL);
  }


  // identify week-games div that is being displayed (all others have class hide)
  let weekGames = document.getElementById('tblGames').querySelectorAll('.week-games');
  let weekNum;
  let tblrows;
  weekGames.forEach((week) => {
    if (week.classList.contains('hide')) return;
    if (tblrows != undefined) return;
    tblrows = week.querySelectorAll('.tblrow');
    weekNum = week.getAttribute('id').replace('week-games-', '');
  });

  formGames.innerHTML = '';
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
      if (pickitem.querySelector('span').classList.contains('opacity-25')) {
        pickFormatting = ['border-danger'];
      } else {
        pickFormatting = ['border-success'];
      }
    }

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
    formGames.appendChild(gamerow.cloneNode(true));
    let game = formGames.querySelector('.gamerow[data-gameid="' + gameid + '"]');
    // add left border to game div
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

    // if status is late, show 'LATE' in a rounded pill in the bottom-right corner of the gamerow (column 2, bottom of column)
    if (status == 'LATE') {
      // let late = document.createElement('span');
      let late = document.createElement('div');
      late.classList.add('rounded-pill', 'text-center', 'text-smaller');
      late.classList.add('bg-danger', 'text-white');
      late.textContent = 'LATE';
      // add class to push this to the bottom of the column
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
      input.setAttribute('data-entryid', entryID);

      // if teamSelectValue matches teamName, check the input
      if (teamSelectValue == teamName) {
        input.setAttribute('checked', '');
        input.setAttribute('data-origchecked', 'true');
        pickedGames++;
      } else {
        input.setAttribute('data-origchecked', 'false');
      }

      if (!is_open) {
        input.setAttribute('disabled', '');
      }

      // if any input values change, show modal footer
      input.addEventListener('change', (e) => {

        let form = document.getElementById('modalForm');
        let modalFooter = form.querySelector('.modal-footer');
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
  // append to subtext if not all games have been picked
  let ttlGames = tblrows.length;
  if (ttlGames != pickedGames) {
    subtext += ' (' + pickedGames + '/' + ttlGames + ' picked)';
  }


  if (openGames == 0) {
    subtext = 'Complete';
  }
  mSub.textContent = subtext;

  updateTimeRemainingDivs();
  // when modal is closed, stop updating dl-clocks
  if (form.hasAttribute('data-dlclocklistener') == false) {
    form.setAttribute('data-dlclocklistener', '');
    form.addEventListener('shown.bs.modal', (e) => {

      setInterval(updateTimeRemainingDivs, 5000);
    })
    form.addEventListener('hidden.bs.modal', (e) => {
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