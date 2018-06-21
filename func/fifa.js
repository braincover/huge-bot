const axios = require('axios');

async function today() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches/today?by_date=asc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return 'FIFA今天沒有比賽喔';
    }
    const replies = matches.map(match => {
      const date = new Date(match.datetime);
      const datetime = date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${match.home_team.country} vs ${match.away_team
        .country} -- ${datetime}`;
    });
    return replies.join('\n');
  } catch (error) {
    throw error;
  }
}

async function current() {
  try {
    const response = await axios.get('http://worldcup.sfg.io/matches/current');
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return 'FIFA現在沒有在比賽喔';
    }
    const match = matches[0];
    return `${match.home_team.country} ${match.home_team.goals} vs ${match
      .away_team.country} ${match.away_team.goals}`;
  } catch (error) {
    throw error;
  }
}

async function last() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches?by_date=desc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return '沒有找到任何比賽';
    }
    const finishedMatches = matches.filter(match => match.winner !== undefined);
    const match = finishedMatches[0];
    return `${match.home_team.country} ${match.home_team.goals} vs ${match
      .away_team.country} ${match.away_team.goals}`;
  } catch (error) {
    throw error;
  }
}

async function tomorrow() {
  try {
    const response = await axios.get(
      'http://worldcup.sfg.io/matches?by_date=asc'
    );
    const matches = response.data;
    if (matches === undefined || matches.length < 1) {
      return 'FIFA現在沒有在比賽喔';
    }
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const replies = matches
      .filter(match => {
        const date = new Date(match.datetime);
        return (
          date.getUTCMonth() === tomorrowDate.getUTCMonth() &&
          date.getUTCDate() === tomorrowDate.getUTCDate()
        );
      })
      .map(match => {
        const date = new Date(match.datetime);
        const datetime = date.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${match.home_team.country} vs ${match.away_team
          .country} -- ${datetime}`;
      });
    return replies.join('\n');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  today,
  current,
  last,
  tomorrow,
};
