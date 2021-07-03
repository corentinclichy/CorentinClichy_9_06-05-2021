import { fireEvent, screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import Bills from "../containers/Bills";
import Firestore from "../app/Firestore";
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

        // $.fn.modal = jest.fn();
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
