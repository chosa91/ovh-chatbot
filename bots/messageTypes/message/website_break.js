"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, ButtonsMessage, TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const responsesCst = require("../../../constants/responses").FR;
const URL = require("url");

class WebsiteBreak {
  static action(senderId, message, entities, res) {
    return utils.getOvhClient(senderId)
      .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
      .then((hostings) => {
        let eltInfos = [];

        if (!hostings.length) {
          return [new TextMessage("Tu n'as pas d'hébergement web :("), new TextMessage(responsesCst.upsellingWeb)];
        }

        if (Array.isArray(entities.url) && entities.url.length) {
          let website = entities.url[0].value.indexOf("http") !== -1 ? entities.url[0].value : "http://" + entities.url[0].value;

          if (hostings.length === 1) {
            let buttons = [new Button("postback", `ATTACHED_DOMAIN_SELECTED_${hostings[0]}_${URL.parse(website).hostname}`, hostings[0])];

            return [new ButtonsMessage("Sélectionne l'hébergement web sur lequel est installé ton site", buttons)];
          }
          eltInfos = hostings.map((hosting) => new Button("postback", `ATTACHED_DOMAIN_SELECTED_${hosting}_${URL.parse(website).hostname}`, hosting));

          return [new TextMessage("Sélectionne l'hébergement web sur lequel est installé ton site"), createPostBackList("Sélectionne l'hébergement web sur lequel est installé ton site", eltInfos, "MORE_HOSTING", 0, 4)];
        }

        if (hostings.length === 1) {
          let buttons = [new Button("postback", `HOSTING_SELECTED_${hostings[0]}`, hostings[0])];

          return [new ButtonsMessage("Sélectionne l'hébergement web sur lequel est installé ton site", buttons)];
        }

        eltInfos = hostings.map((hosting) => new Button("postback", `HOSTING_SELECTED_${hosting}`, hosting));

        return [new TextMessage("Sélectionne l'hébergement web sur lequel est installé ton site"), createPostBackList("Sélectionne l'hébergement web sur lequel est installé ton site", eltInfos, "MORE_HOSTING", 0, 4)];
      })
      .catch((err) => {
        res.logger.error(err);
        return Bluebird.reject(error(err.error || err.statusCode || 400, err));
      });
  }
}

module.exports = { website_break: WebsiteBreak };
