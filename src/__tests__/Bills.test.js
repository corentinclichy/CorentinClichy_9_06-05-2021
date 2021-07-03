import { fireEvent, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import Bills from "../containers/Bills";
import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      //mock firestore bills function (async/await)
      Firestore.bills = () => ({ get: jest.fn().mockResolvedValue() });

      //define User
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      //Set Router parameter
      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      // run router
      Router();

      //check class active
      const icoWin = screen.getByTestId("icon-window");
      expect(icoWin).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => b - a;

      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("When data is loading", () => {
      test("Then, Sould render loading page", () => {
        // logged user
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        const html = BillsUI({ loading: true });
        document.body.innerHTML = html;

        const loadingMessage = screen.getByText("Loading...");

        expect(loadingMessage).toBeTruthy();
      });
    });

    describe("When back-end send an error message", () => {
      test("Then, Error page should be rendered", () => {
        const html = BillsUI({ error: "some error message" });
        document.body.innerHTML = html;
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
    });

    describe("When user don't have saved any bills", () => {
      test("Then the bills list should be empty", () => {
        // logged user
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        const html = BillsUI({ data: [] });
        document.body.innerHTML = html;

        const bills = screen.queryByTestId("bill-item");

        expect(bills).toBeNull();
      });
    });

    describe("When I click new bill button", () => {
      test("Then, new bills UI render", () => {
        // logged user
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        const html = BillsUI({ data: [] });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const firestore = null;
        const localStorage = window.localStorage;

        const billsController = new Bills({
          document,
          onNavigate,
          firestore,
          localStorage,
        });

        const handleClickNewBills = jest.fn(() => {
          billsController.handleClickNewBill();
        });

        const newBillButton = screen.getByTestId("btn-new-bill");
        newBillButton.addEventListener("click", handleClickNewBills);

        fireEvent.click(newBillButton);

        const newBillUITitle = screen.getByTestId("form-new-bill");

        expect(newBillUITitle).toBeTruthy();
      });
    });
    describe("When I click on icon-eye button ", () => {
      test("Then modal should open", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        const html = BillsUI({ data: [bills[1]] });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const firestore = null;
        const localStorage = window.localStorage;

        const billsController = new Bills({
          document,
          onNavigate,
          firestore,
          localStorage,
        });

        const handleClickIconEye = jest.fn(billsController.handleClickIconEye);
        const iconEyeButton = screen.getByTestId("icon-eye");

        iconEyeButton.addEventListener("click", handleClickIconEye);

        userEvent.click(iconEyeButton);

        expect(handleClickIconEye).toHaveBeenCalled();
        const modale = screen.getByTestId("modaleFile");

        expect(modale).toBeTruthy();
      });
    });
  });
});

// Test intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to BillsUI", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
