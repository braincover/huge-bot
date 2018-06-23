const axios = require('axios');
const moment = require('moment');
require('moment-timezone');

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
    const match = matches[0];
    return `${match.home_team.country} ${match.home_team.goals} vs ${match
      .away_team.country} ${match.away_team.goals}`;
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
    return `${match.home_team.country} ${match.home_team.goals} vs ${match
      .away_team.country} ${match.away_team.goals} -- ${moment(match.datetime)
      .tz('Asia/Taipei')
      .format('MM/DD HH:mm')}`;
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
    const group = groups.find(
      element => element.group.letter.toUpperCase() === code.toUpperCase()
    );
    if (group === undefined) {
      return `找不到小組 ${code}`;
    }
    const replies = group.group.teams
      .map(obj => obj.team)
      .map(
        team =>
          ` ${team.games_played}  ${team.wins} ${team.draws} ${team.losses}  ${team.goals_for} ${team.goals_against} ${team.goal_differential}  ${team.points}  ${team.fifa_code}`
      );
    return `小組 ${group.group.letter} 戰況\n賽 勝.平.負 得.失.差 分 球隊\n${replies.join(
      '\n'
    )}`;
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
    const replies = groups.map(
      group =>
        `Group ${group.group.letter}:\n${group.group.teams
          .map(team => team.team)
          .map(team => `  ${team.country} ( ${team.fifa_code} )`)
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
    const teamResult = `${team.country} ( ${team.fifa_code} ) 組${team.group_letter}\n賽 勝.平.負 得.失.差 分\n ${team.games_played}  ${team.wins} ${team.draws} ${team.losses}  ${team.goals_for} ${team.goals_against} ${team.goal_differential}  ${team.points}`;

    const matchesResponse = await axios.get(
      `http://worldcup.sfg.io/matches/country?fifa_code=${team.fifa_code}`
    );
    const matches = matchesResponse.data;
    if (matches === undefined || matches.length < 1) {
      throw new Error('找不到任何資料');
    }
    const replies = matches.map(match => {
      const home =
        match.home_team.fifa_code === team.fifa_code
          ? '_'
          : match.home_team.country;
      const away =
        match.away_team.fifa_code === team.fifa_code
          ? '_'
          : match.away_team.country;
      if (match.status === 'future') {
        return `${home} vs ${away} -- ${moment(match.datetime)
          .tz('Asia/Taipei')
          .format('MM/DD HH:mm')}`;
      }
      return `${home} ${match.home_team.goals} vs ${away} ${match.away_team
        .goals} -- ${moment(match.datetime).tz('Asia/Taipei').format('MM/DD')}`;
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
    return `${match.home_team.country} vs ${match.away_team
      .country} -- ${moment(match.datetime)
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
