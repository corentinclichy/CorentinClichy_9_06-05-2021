import firebase from "./firebase";

export const errorPage404 = () => {
  firebase.get.mockImplementationOnce(() =>
    Promise.reject(new Error("Erreur 404"))
  );
};

export const errorPage500 = () => {
  firebase.get.mockImplementationOnce(() =>
    Promise.reject(new Error("Erreur 500"))
  );
};
