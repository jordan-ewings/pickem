
/* ------------------------------------------------ */

function procSheet(raw) {
  const table = JSON.parse(raw.substring(47).slice(0, -2))['table'];
  let headers;
  let data;

  if (table.parsedNumHeaders == 1) {
    headers = table.cols.map((x) => {
      if (x) return x.label;
    }).filter(function (el) {
      return el != null;
    });
    data = table.rows.filter((x, index) => index >= 0);
  } else {
    headers = table.rows[0].c.map((x) => {
      if (x) return x.v;
    }).filter(function (el) {
      return el != null;
    });
    data = table.rows.filter((x, index) => index >= 1);
  }

  data = data.map((row) => {
    let d = {};
    let cols = headers;
    cols.forEach((c) => {
      let val = row.c[headers.indexOf(c)];
      if (val == null) {
        d[c] = '';
      } else {
        if (val.f) {
          d[c] = val.f;
        } else {
          d[c] = val.v;
        }
      }
    });
    return d;
  });

  return data;
}

/* ------------------------------------------------ */

function procData(dbGames, dbResponses) {
  let data = dbGames.map((game) => {
    let responses = dbResponses.filter((x) => x['game_id'] == game['game_id']);
    game.gameday = game.gametime_short.split(' @ ')[0];
    game.gameday_long = game.gametime_long.split(' @ ')[0];
    game.gametime = game.gametime_short.split(' @ ')[1];
    game.away_logo = (game.away_team != 'TBD') ? game.away_logo.replace('500', '500-dark') : game.away_logo;
    game.home_logo = (game.home_team != 'TBD') ? game.home_logo.replace('500', '500-dark') : game.home_logo;
    let rec = [
      'game_id', 'week', 'week_label', 'gameday_long', 'gameday', 'gametime', 'state', 'stateshort',
      'away_team', 'away_teamshort', 'away_teamfull', 'away_record', 'away_logo', 'away_score', 'away_color',
      'home_team', 'home_teamshort', 'home_teamfull', 'home_record', 'home_logo', 'home_score', 'home_color',
      'spread', 'win_team']
      .reduce((obj2, key) => (obj2[key] = game[key], obj2), {});

    if (responses.length > 0) {
      // let resp = responses.map((r) => {
      //   return {
      //     player: r.player,
      //     pick_team: r.pick_team, pick_teamshort: r.pick_teamshort, pick_logo: r.pick_logo,
      //     status: r.status, f_underdog: r.f_underdog, f_win: r.f_win
      //   }
      // });
      rec['responses'] = responses;
    }
    return rec;
  });

  let weeks = data.map((x) => x['week']);
  weeks = weeks.filter((c, index) => weeks.indexOf(c) === index);
  let weeklydata = weeks.map((w) => {
    let games = data.filter((x) => x['week'] == w);
    let week_label = games[0]['week_label'];
    return {
      week: w,
      week_label: week_label,
      games: games
    }
  });

  return weeklydata;
}

class El {

  constructor(tag) {
    this.tag = tag;
    this.classes = '';
    this.styles = '';
    this.src = '';
    this.inner = '';
    this.id = '';
    this.onclick = '';
    this.data = {};
  }

  // addData(k, v) {
  //   this.data[k] = v;
  //   return this;
  // }

  addId(i) {
    this.id = i;
    return this;
  }

  addClass(c) {
    this.classes += ' ' + c;
    this.classes = this.classes.trim();
    return this;
  }

  addStyle(s) {
    this.styles += ' ' + s;
    this.styles = this.styles.trim();
    return this;
  }

  addSrc(s) {
    this.src = s;
    return this;
  }

  addChild(i) {
    if (!(typeof i === "string")) {
      this.inner += i.html();
    } else {
      this.inner += i;
    }
    return this;
  }

  addChildren(j) {
    j.forEach((i) => {
      if (!(typeof i === "string")) {
        this.inner += i.html();
      } else {
        this.inner += i;
      }
    });
    return this;
  }

  html() {
    let v = `<${this.tag}`;
    if (this.id != '') v += ` id="${this.id}"`;
    if (this.classes != '') v += ` class="${this.classes}"`;
    if (this.styles != '') v += ` style="${this.styles}"`;
    if (this.onclick != '') v += ` onclick="${this.onclick}"`;
    if (this.src != '') v += ` src="${this.src}"`;
    // for (k in this.data) {
    //   v += ` data-${k}="${this.data[k]}"`;
    // }

    v += `>`;
    if (this.inner != '') v += `${this.inner}`;
    v += `</${this.tag}>`;
    return v;
  }

}