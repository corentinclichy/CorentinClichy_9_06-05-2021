import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

import { textToDate } from "../app/format.js";

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", (e) => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = (e) => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = $("#eye").attr("data-bill-url");
    console.log(billUrl);
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`
      );
    if (typeof $("#modaleFile").modal === "function")
      $("#modaleFile").modal("show");
  };

  // not need to cover this function by tests
  /* istanbul ignore next  */
  getBills = () => {
    const userEmail = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).email
      : "";
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then((snapshot) => {
          const bills = snapshot.docs
            .map((doc) => {
              try {
                return {
                  ...doc.data(),
                  date: formatDate(doc.data().date),
                  status: formatStatus(doc.data().status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e, "for", doc.data());
                return {
                  ...doc.data(),
                  date: doc.data().date,
                  status: formatStatus(doc.data().status),
                };
              }
            })
            .filter((bill) => bill.email === userEmail)
            .sort((bill1, bill2) => {
              const date1 = textToDate(bill1.date);
              const date2 = textToDate(bill2.date);

              if (date1 <= date2) return 1;
              if (date1 > date2) return -1;
            });

          console.log(bills);

          return bills;
        })
        .catch((error) => error);
    }
  };
}

/* istanbul ignore next  */
export const sortBillsByDate = (bills) => {
  const billsCopy = [...bills];

  billsCopy.sort((bill1, bill2) => {
    const date1 = convertToDate(bill1.date);
    const date2 = convertToDate(bill2.date);

    if (date1 <= date2) return 1;
    if (date1 > date2) return -1;
  });

  return billsCopy;
};
