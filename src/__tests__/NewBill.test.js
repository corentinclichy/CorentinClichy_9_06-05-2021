import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/dom";
import { ROUTES } from "../constants/routes";
import firebase from "../__mocks__/firebase";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and try to upload a file who are not png, jpeg, or jpg", () => {
    test("Then i should get an error message", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const firestore = null;
      const localStorage = window.localStorage;

      const NewBillsController = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });

      const fileName = new File(["foo"], "foo.txt", {
        type: "text/plain",
      });

      let file = screen.getByTestId(`file`);

      fireEvent.change(file, { target: { files: [fileName] } });

      let errorMessage = screen.getByTestId("error-extension");

      expect(errorMessage.innerHTML).toBe(
        "Fichier JPG, JPEG ou PNG uniquement"
      );
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I fill all fields in NewBill form and I submit", () => {
    test("Then i get to billUI and I whould show the bill", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Corentin",
          email: "corentin@gmail.com",
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const inputData = {
        type: "Transports",
        name: "uber",
        amount: "300",
        date: "2017-06-01",
        pct: "20",
        fileName: "test.png",
      };

      const billType = screen.getByTestId("expense-type");
      fireEvent.change(billType, { target: { value: inputData.type } });
      expect(billType.value).toBe(inputData.type);

      const billName = screen.getByTestId("expense-name");
      fireEvent.change(billName, { target: { value: inputData.name } });
      expect(billName.value).toBe(inputData.name);

      const billDate = screen.getByTestId("datepicker");
      fireEvent.change(billDate, { target: { value: inputData.date } });
      expect(billDate.value).toBe(inputData.date);

      const billAmount = screen.getByTestId("amount");
      fireEvent.change(billAmount, { target: { value: inputData.amount } });
      expect(billAmount.value).toBe(inputData.amount);

      const billPct = screen.getByTestId("pct");
      fireEvent.change(billPct, { target: { value: inputData.pct } });
      expect(billPct.value).toBe(inputData.pct);

      const firestore = null;
      const localStorage = window.localStorage;

      const NewBillsController = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: localStorage,
      });

      NewBillsController.fileName = "image.jpg";

      const handleSubmit = jest.fn(NewBillsController.handleSubmit);
      const submitFormBtn = screen.getByTestId("form-new-bill");
      submitFormBtn.addEventListener("submit", handleSubmit);
      fireEvent.submit(submitFormBtn);
      expect(handleSubmit).toHaveBeenCalled();

      const billPageTitle = screen.getAllByText("Mes notes de frais");
      // const billNameOnBillPage = screen.getAllByText("uber");

      expect(billPageTitle).toBeTruthy();
      // expect(billNameOnBillPage).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee and I am on newBill", () => {
  describe("when I submit the form", () => {
    test("Post bill to the mock API and total bills should be 5", async () => {
      const postSpy = jest.spyOn(firebase, "post");

      const bills = await firebase.post({
        id: "103204",
        pct: 20,
        amount: 300,
        email: "corentin@gmail.com",
        name: "uber",
        vat: "50",
        fileName: "facture.jpg",
        date: "2020-06-10",
        commentary: "uber ride",
        type: "Transports",
        fileUrl: "https://corentin.com",
        status: "pending",
        commentAdmin: "",
      });
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(5);
    });
    test("Add bill to API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("Add bill to API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
