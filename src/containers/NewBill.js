import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    new Logout({ document, localStorage, onNavigate });
    this.fileExtension = null;
  }
  handleChangeFile = (e) => {
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    console.log(file);

    const filePath = file.name.split(/\\/g);
    console.log(filePath);

    const fileName = filePath[filePath.length - 1];
    console.log(fileName);

    const fileNameSplit = fileName.split(".");
    console.log(fileNameSplit);

    //Get the extension name - get the last element of fileNameSplit
    const fileExtension = fileNameSplit.slice(-1)[0];
    console.log(fileExtension);

    const errorMessage = this.document.querySelector(
      'p[data-testid="error-extension"]'
    );

    if (
      fileExtension === "jpg" ||
      fileExtension === "png" ||
      fileExtension === "jpeg" ||
      fileExtension === "JPG" ||
      fileExtension === "JPEG"
    ) {
      errorMessage.innerHTML = "";
      this.firestore.storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          this.fileUrl = url;
          this.fileName = fileName;
          this.fileExtension = fileExtension;
        });
    } else {
      e.target.value = "";
      console.log(errorMessage);
      errorMessage.innerHTML = "Fichier JPG ou PNG uniquement";
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.createBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => error);
    }
  };
}
