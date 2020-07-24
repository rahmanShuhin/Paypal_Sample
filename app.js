const express = require("express");
const ejs = require("ejs");
const paypal = require("paypal-rest-sdk");

const app = express();

app.set("view engine", "ejs");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ASUZD7k9TEv_Fi-02LrTSP6P3FPAI26jhn2YXnUpc_r0ji8X0vuabmj_Rv0prAweThE5_YGVfXh2IyxO",
  client_secret:
    "ELVwMJLhHmY2fEVdHMVdaQGY86kY9QOQpMaOnG8eC-ZaXFfqlQpBZS3vFUeFC8wLetfBgNW45OxzE_c-",
});

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/success",
      cancel_url: "http://localhost:5000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "item",
              price: "20.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "20.00",
        },
        description: "This is the payment description.",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "20.00",
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("success");
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancel"));

app.get("/", (req, res) => res.render("index"));

app.listen(5000, () => console.log("server started"));
