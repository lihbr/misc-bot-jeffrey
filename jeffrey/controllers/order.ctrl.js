/**
 * Imports
 */

// Node
const _ = require("lodash");

// Inner
const get = require("../helpers/get");
const string = require("../helpers/string");

const jeffrey = require("../models/jeffrey.model");
const order = require("../models/order.model");
const user = require("../models/user.model");

const options = require("../options");

/**
 * Config
 */

/**
 * Add
 */
exports.add = async event => {
  const { raw, rows } = await order.add(event.text, event.user);

  let author;
  if (!!rows) {
    author = await user.get(event.user);

    if (!author) {
      const profile = await jeffrey.getUser(event.user);
      if (profile) {
        author = await user.create(event.user, profile.name, profile.phone);
      }
    }

    if (author) {
      author.total = JSON.parse(author.total);

      for (const type of raw.types) {
        author.total[type] = author.total[type]
          ? author.total[type] + raw[type]
          : raw[type];

        author.balance -= raw[type] * options.config.orders[type].value;
      }

      author.total = JSON.stringify(author.total);

      const update = user.update(author); // async
    }
  }

  const result = await jeffrey.say({
    url: event.response_url,
    channel: event.channel,
    user: event.user,
    blocks: [
      {
        textKey: `addOrder_${raw.types.length}`,
        data: raw.data
      }
    ],
    error: !rows || !author
  });

  if (!(!rows || !author)) {
    let key = "";
    if (author.balance <= 0) {
      key = "warnBalanceNull";
    } else if (author.balance <= options.config.balance.warnAt) {
      key = "warnBalanceLow";
    }

    if (key) {
      const warnData = {
        balance: author.balance,
        plural: author.balance > 1 ? "s" : ""
      };

      const warn = await jeffrey.say({
        channel: "dm",
        user: event.user,
        blocks: [
          {
            textKey: key,
            data: warnData
          }
        ]
      });
    }
  }

  order.prune();

  return !(!rows || !author);
};

/**
 * Stats
 */
exports.stats = async (event, data) => {
  const [channel, orders] = await Promise.all([
    jeffrey.getDMChannel(event.user),
    order.getAll()
  ]);

  const blocks = [{ textKey: "statsIntro" }, { key: "divider" }];

  if (orders.length) {
    const block = {
      key: "statsDetails",
      data: {}
    };

    // Create global and users object
    const global = { total: 0 };
    let users = {};
    for (const key in options.config.orders) {
      if (options.config.orders.hasOwnProperty(key)) {
        global[key] = 0;
      }
    }
    for (const order of orders) {
      order.total = parseInt(order.total);
      const { uid, type, total, name } = order;

      if (!users[uid]) {
        users[uid] = {
          name,
          uid,
          total: 0
        };
        for (const key in options.config.orders) {
          if (options.config.orders.hasOwnProperty(key)) {
            users[uid][key] = 0;
          }
        }
      }

      users[uid][type] += total;
      users[uid].total += total;
      global[type] += total;
      global.total += total;
    }
    // Get author
    const author = users[event.user];

    // Convert users to array
    const temp = [];
    for (const uid in users) {
      if (users.hasOwnProperty(uid)) {
        temp.push(users[uid]);
      }
    }
    users = temp;

    block.data = {
      g_total: global.total,
      g_detail: get.detail(global),
      u_total: author.total,
      u_detail: get.detail(author)
    };

    blocks.push(block);

    blocks.push({ key: "divider" });

    blocks.push({ textKey: "statsMonthTop" });

    let fields = [
      get.top({
        users,
        key: "total",
        intro: "*Overall:*",
        limit: 5
      })
    ];
    let count = 1;
    for (const key in options.config.orders) {
      if (options.config.orders.hasOwnProperty(key)) {
        fields.push(
          get.top({
            users,
            key,
            intro: `*${options.config.orders[key].emoji} ${string.ucFirst(
              key
            )}:*`,
            limit: 5
          })
        );
        if (++count === 2) {
          count = 0;
          blocks.push({
            type: "section",
            fields
          });
          fields = [];
        }
      }
    }
    if (count !== 0) {
      blocks.push({
        type: "section",
        fields
      });
    }
  }

  const result = await jeffrey.say({
    url: data === "dm" ? "" : event.response_url,
    channel: data === "dm" ? "dm" : event.channel,
    user: event.user,
    blocks,
    error: !orders.length
  });

  const callback = data === "dm" ? await jeffrey.checkDM(event, channel) : true;

  return !!orders.length;
};
