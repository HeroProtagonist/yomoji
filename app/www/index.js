const _ = require('lodash');
const { getLeaders } = require("../models");
const { getUsersInfo } = require("../slack");

const leaderBoard = async (req, res) => {
  const [topRecipients, topGivers] = await Promise.all([
    getLeaders("recipients"),
    getLeaders("givers"),
  ]);

  const userNames = new Set([
    ...topRecipients.map(u => u.user_name),
    ...topGivers.map(u => u.user_name),
  ])

  const userPromises = Array.from(userNames).map((userName) => getUsersInfo(userName));
  const userInfo = await Promise.all(userPromises);
  const userStore = _.keyBy(userInfo, 'id')

  const topRecipientsDetailed = topRecipients.map(u => ({...u, ...userStore[u.user_name]}))
  const topGiversDetailed = topGivers.map(u => ({...u, ...userStore[u.user_name]}))

  const recipients = topRecipientsDetailed.map(({ profile, sum }) => ({
    realName: profile.real_name,
    displayName: profile.display_name,
    profileImage: profile.image_512,
    title: profile.title,
    total: sum,
  }));

  const givers = topGiversDetailed.map(({ profile, sum }) => ({
    realName: profile.real_name,
    displayName: profile.display_name,
    profileImage: profile.image_512,
    title: profile.title,
    total: sum,
  }));

  res.render("index", { recipients, givers });
};

module.exports = leaderBoard;
