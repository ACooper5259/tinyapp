// Helper functions

const findUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
};

const urlsForUserId = function (user_id, database) {
  const singleUserUrls = [];
  for (let item in database) {
    const shortURL = database[item];
    if (shortURL['user_id'] === user_id) {
      const userUrl = {
        shortURL_id: shortURL.shortURL_id,
        longURL: shortURL.longURL
      }
      singleUserUrls.push(userUrl);
    };
  };
  return singleUserUrls;
};

module.exports.findUserByEmail = findUserByEmail;
module.exports.generateRandomString = generateRandomString;
module.exports.urlsForUserId = urlsForUserId;