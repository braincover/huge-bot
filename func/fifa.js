const axios = require('axios');
const moment = require('moment');
require('moment-timezone');

function flagOf(code) {
  switch (code.toUpperCase()) {
    case 'SWE':
      return '🇸🇪';
    case 'KOR':
      return '🇰🇷';
    case 'GER':
      return '🇩🇪';
    case 'SRB':
      return '🇷🇸';
    case 'BRA':
      return '🇧🇷';
    case 'SUI':
      return '🇨🇭';
    case 'CRC':
      return '🇨🇷';
    case 'BEL':
      return '🇧🇪';
    case 'TUN':
      return '🇹🇳';
    case 'ENG':
      return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    case 'PAN':
      return '🇵🇦';
    case 'JPN':
      return '🇯🇵';
    case 'SEN':
      return '🇸🇳';
    case 'POL':
      return '🇵🇱';
    case 'COL':
      return '🇨🇴';
    case 'URU':
      return '🇺🇾';
    case 'RUS':
      return '🇷🇺';
    case 'KSA':
      return '🇸🇦';
    case 'EGY':
      return '🇪🇬';
    case 'ESP':
      return '🇪🇸';
    case 'MAR':
      return '🇲🇦';
    case 'IRN':
      return '🇮🇷';
    case 'POR':
      return '🇵🇹';
    case 'DEN':
      return '🇩🇰';
    case 'FRA':
      return '🇫🇷';
    case 'AUS':
      return '🇦🇺';
    case 'PER':
      return '🇵🇪';
    case 'ISL':
      return '🇮🇸';
    case 'CRO':
      return '🇭🇷';
    case 'NGA':
      return '🇳🇬';
    case 'ARG':
      return '🇦🇷';
    case 'MEX':
      return '🇲🇽';
    default:
      return `(${code.toUpperCase()})`;
  }
}

function timeOf(event) {
  return event.time
    .replace("'", '')
    .split('+')
    .map(t => parseInt(t, 10))
    .reduce((sum, obj) => sum + obj);
}

function eventDesc(team, event, next) {
  let desc;
  switch (event.type_of_event) {
    case 'goal': {
      desc = `${event.player} 🎉GOAL`;
      break;
    }
    case 'goal-own': {
      desc = `${event.player} 😱烏龍球`;
      break;
    }
    case 'goal-penalty': {
      desc = `${event.player} 🥅十二碼`;
      break;
    }
    case 'substitution-out': {
      desc = `🔽${event.player} 🔼${next.player}`;
      break;
    }
    case 'substitution-in': {
      desc = '';
      break;
    }
    case 'red-card': {
      desc = `${event.player} ⛔紅牌`;
      break;
    }
    case 'yellow-card': {
      desc = `${event.player} ⚠️黃牌`;
      break;
    }
    case 'yellow-card-second': {
      desc = `${event.player} ⚠️雙黃牌⚠️`;
      break;
    }
    default: {
      desc = `${event.player} ${event.type_of_event}`;
      break;
    }
  }
  if (desc.length === 0) {
    return undefined;
  }
  const result = `${event.time} ${flagOf(team.code)} ${desc}`;
  return result;
}

function matchDetail(match) {
  const descriptions = [];
  const a = match.home_team_events;
  const b = match.away_team_events;
  while (a.length || b.length) {
    let desc;
    if (!a[0]) {
      desc = eventDesc(match.away_team, b[0], b[1]);
      b.splice(0, 1);
    } else if (!b[0]) {
      desc = eventDesc(match.home_team, a[0], a[1]);
      a.splice(0, 1);
    } else if (timeOf(a[0]) > timeOf(b[0])) {
      desc = eventDesc(match.away_team, b[0], b[1]);
      b.splice(0, 1);
    } else {
      desc = eventDesc(match.home_team, a[0], a[1]);
      a.splice(0, 1);
    }
    if (desc) {
      descriptions.push(desc);
    }
  }
  return `時間軸:\n${descriptions.join('\n')}`;
}

async function todayMatches() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches/today?by_date=asc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return '世界杯今天沒有比賽喔';
    }
    const replies = matches.map(
      match =>
        `${match.home_team.country} vs ${match.away_team.country} -- ${moment(
          match.datetime
        )
          .tz('Asia/Taipei')
          .format('HH:mm')}`
    );
    return replies.join('\n');
  } catch (error) {
    throw error;
  }
}

async function tomorrowMatches() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches/tomorrow?by_date=asc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return '世界杯明天沒有比賽喔';
    }
    const replies = matches.map(
      match =>
        `${match.home_team.country} vs ${match.away_team.country} -- ${moment(
          match.datetime
        )
          .tz('Asia/Taipei')
          .format('HH:mm')}`
    );
    return replies.join('\n');
  } catch (error) {
    throw error;
  }
}

async function currentMatch() {
  try {
    const response = await axios.get('http://worldcup.sfg.io/matches/current');
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return '世界杯現在沒有在比賽喔';
    }

    const replies = matches.map(
      match =>
        `${flagOf(match.home_team.code)}${match.home_team.country} ${
          match.home_team.goals
        } vs ${flagOf(match.away_team.code)}${match.away_team.country} ${
          match.away_team.goals
        }\n經過時間: ${match.time}\n${matchDetail(match)}`
    );
    return replies.join('\n==========\n');
  } catch (error) {
    throw error;
  }
}

async function lastMatch(code) {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches?by_date=desc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      throw new Error('找不到任何資料');
    }
    const finishedMatches = matches
      .filter(match => match.status === 'completed')
      .filter(match => {
        if (!code) {
          return true;
        }
        let flag = false;
        if (match.home_team.code) {
          flag =
            flag ||
            match.home_team.country.toUpperCase() === code.toUpperCase() ||
            match.home_team.code.toUpperCase() === code.toUpperCase();
        }
        if (match.away_team.code) {
          flag =
            flag ||
            match.away_team.country.toUpperCase() === code.toUpperCase() ||
            match.away_team.code.toUpperCase() === code.toUpperCase();
        }
        return flag;
      });
    if (finishedMatches.length === 0) {
      return '查無任何完成賽事';
    }
    const match = finishedMatches[0];
    return `${flagOf(match.home_team.code)}${match.home_team.country} ${
      match.home_team.goals
    } vs ${flagOf(match.away_team.code)}${match.away_team.country} ${
      match.away_team.goals
    } -- ${moment(match.datetime)
      .tz('Asia/Taipei')
      .format('MM/DD HH:mm')}\n${matchDetail(match)}`;
  } catch (error) {
    throw error;
  }
}

async function groupStatus(code) {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/teams/group_results'
    );
    const groups = response.data;
    if (groups === undefined || groups.length < 1) {
      throw new Error('找不到任何資料');
    }
    const group = groups
      .map(_group => (_group.group ? _group.group : _group))
      .find(element => element.letter.toUpperCase() === code.toUpperCase());
    if (group === undefined) {
      return `找不到小組 ${code}`;
    }
    const replies = group.ordered_teams
      .map(team => (team.team ? team.team : team))
      .map(
        team =>
          ` ${team.games_played}  ${team.wins} ${team.draws} ${team.losses}  ${
            team.goals_for
          } ${team.goals_against} ${team.goal_differential}  ${team.points}  ${
            team.fifa_code
          }`
      );
    return `小組 ${
      group.letter
    } 戰況\n賽 勝.平.負 得.失.差 分 球隊\n${replies.join('\n')}`;
  } catch (error) {
    throw error;
  }
}

async function teamsStatus() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/teams/group_results'
    );
    const groups = response.data;
    if (groups === undefined || groups.length < 1) {
      throw new Error('找不到任何資料');
    }
    const replies = groups
      .map(_group => (_group.group ? _group.group : _group))
      .map(
        group =>
          `Group ${group.letter}:\n${group.ordered_teams
            .map(team => (team.team ? team.team : team))
            .map(
              team =>
                `  ${flagOf(team.fifa_code)}${team.country} (${team.fifa_code})`
            )
            .join('\n')}`
      );
    return replies.join('\n');
  } catch (error) {
    throw error;
  }
}

async function teamStatus(code) {
  try {
    const teamsResponse = await axios.get(
      'http://worldcup.sfg.io/teams/results'
    );
    const teams = teamsResponse.data;
    if (teams === undefined || teams.length < 1) {
      throw new Error('找不到任何資料');
    }
    const team = teams.find(
      obj =>
        obj.country.toUpperCase() === code.toUpperCase() ||
        obj.fifa_code.toUpperCase() === code.toUpperCase()
    );
    if (team === undefined) {
      return `找不到球隊 ${code}`;
    }
    const teamResult = `${flagOf(team.fifa_code)}${team.country} (${
      team.fifa_code
    }) 組${team.group_letter}\n賽 勝.平.負 得.失.差 分\n ${
      team.games_played
    }  ${team.wins} ${team.draws} ${team.losses}  ${team.goals_for} ${
      team.goals_against
    } ${team.goal_differential}  ${team.points}`;

    const matchesResponse = await axios.get(
      `http://worldcup.sfg.io/matches/country?fifa_code=${team.fifa_code}`
    );
    const matches = matchesResponse.data;
    if (matches === undefined || matches.length < 1) {
      throw new Error('找不到任何資料');
    }
    const replies = matches.map(match => {
      const home =
        match.home_team.code === team.fifa_code
          ? flagOf(team.fifa_code)
          : match.home_team.country;
      const away =
        match.away_team.code === team.fifa_code
          ? flagOf(team.fifa_code)
          : match.away_team.country;
      switch (match.status) {
        case 'future':
          return `${home} vs ${away} -- ${moment(match.datetime)
            .tz('Asia/Taipei')
            .format('MM/DD HH:mm')}`;
        case 'in progress':
          return `${home} ${match.home_team.goals} vs ${away} ${
            match.away_team.goals
          } ⏳賽中⌛️`;
        case 'completed':
        default:
          return `${home} ${match.home_team.goals} vs ${away} ${
            match.away_team.goals
          } -- ${moment(match.datetime)
            .tz('Asia/Taipei')
            .format('MM/DD')}`;
      }
    });
    const matchResult = replies.join('\n');
    return `${teamResult}\n${matchResult}`;
  } catch (error) {
    throw error;
  }
}

async function nextMatch(code) {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches?by_date=asc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      throw new Error('找不到任何資料');
    }
    const futureMatches = matches
      .filter(match => match.status === 'future')
      .filter(match => {
        if (!code) {
          return true;
        }
        let flag = false;
        if (match.home_team.code) {
          flag =
            flag ||
            match.home_team.country.toUpperCase() === code.toUpperCase() ||
            match.home_team.code.toUpperCase() === code.toUpperCase();
        }
        if (match.away_team.code) {
          flag =
            flag ||
            match.away_team.country.toUpperCase() === code.toUpperCase() ||
            match.away_team.code.toUpperCase() === code.toUpperCase();
        }
        return flag;
      });
    if (futureMatches.length === 0) {
      return '查無任何未來賽事';
    }
    const match = futureMatches[0];
    return `${match.home_team.country} vs ${
      match.away_team.country
    } -- ${moment(match.datetime)
      .tz('Asia/Taipei')
      .format('MM/DD HH:mm')}`;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  todayMatches,
  currentMatch,
  lastMatch,
  tomorrowMatches,
  groupStatus,
  teamsStatus,
  teamStatus,
  nextMatch,
};
