import firebase from 'firebase/app';
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import store from '@/state/store'

class FirebaseAuthBackend {

    constructor(firebaseConfig) {
        if (firebaseConfig) {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            var auth = firebase.auth();
            if (process.env.NODE_ENV  === "development"){
                firebase.firestore().useEmulator('localhost', 8083);
                auth.useEmulator(process.env.VUE_APP_FB_EMUL_AUTH_URL);
            }
            auth.onAuthStateChanged((user) => {
                if (user) {
                    sessionStorage.setItem("authUser", JSON.stringify(user));
                } else {
                    sessionStorage.removeItem('authUser');
                }
            });
        }
    }

    /**
     * Registers the user with given details
     */
    registerUser = (email, password) => {
        return new Promise((resolve, reject) => {
            const auth = firebase.auth();
            auth.createUserWithEmailAndPassword(email, password).then(() => {
                // eslint-disable-next-line no-redeclare
                var user = firebase.auth().currentUser;               
                resolve(user);               
            }, (error) => {
                reject(this._handleError(error));
            });
        });
    }

    /**
     * Login user with given details
     */
    loginUser = (email, password) => {
        return new Promise((resolve, reject) => {
            const auth = firebase.auth();
            auth.signInWithEmailAndPassword(email, password).then((user) => {
                // eslint-disable-next-line no-redeclare
                var user = firebase.auth().currentUser;
                resolve(user);
            }, (error) => {
                reject(this._handleError(error));
            });
        });
    }

    /**
     * Update profile detail
     */
    updateProfile = (update) => {    
        return new Promise((resolve, reject) => {       
            const auth = firebase.auth();
            if (update.displayName !== undefined ){  
                auth.currentUser.updateProfile(update).then(() => {
                    const uid = auth.currentUser.uid;
                    getFirebaseBackend().getFirestore().collection("Users").doc(uid).update(update).then(() => {  
                        resolve(true);
                     }).catch((error) => {
                        reject(this._handleError(error));  
                    });
                }).catch((error) => {
                    reject(this._handleError(error));
                });
            }else{
                var uid = store.getters['auth/getCurrentUser'].uid;    
                 if (uid === undefined) auth.currentUser
                var db = getFirebaseBackend().getFirestore();
                db.collection("Users").doc(uid).update(update).then(() => { 
                    resolve(true);
                }).catch((error) => {
                    reject(this._handleError(error));
                });
            }
        });
    }    






    /**
     * getFirestore
     */
     getFirestore = () => {
        var db = firebase.firestore();
        return db;        
    }
    

    /**
     * forget Password user with given details
     */
    forgetPassword = (email) => {
        return new Promise((resolve, reject) => {
            const auth = firebase.auth();
            auth.sendPasswordResetEmail(email, { url: window.location.protocol + "//" + window.location.host + "/login" }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(this._handleError(error));
            })
        });
    }

    /**
     * Logout the user
     */
    logout = () => {
        return new Promise((resolve, reject) => {
            const auth = firebase.auth();
            auth.signOut().then(() => {
                resolve(true);
            }).catch((error) => {
                reject(this._handleError(error));
            })
        });
    }

    setLoggeedInUser = (user) => {
        sessionStorage.setItem("authUser", JSON.stringify(user));
    }

    /**
     * Returns the authenticated user
     */
    getAuthenticatedUser = () => {
        if (!sessionStorage.getItem('authUser'))
            return null;
        return JSON.parse(sessionStorage.getItem('authUser'));
    }

    /**
     * Handle the error
     * @param {*} error 
     */
    _handleError(error) {
        var errorMessage = error.message;
        return errorMessage;
    }
}

let _fireBaseBackend = null;

/**
 * Initilize the backend
 * @param {*} config 
 */
const initFirebaseBackend = (config) => {
    if (!_fireBaseBackend) {
        _fireBaseBackend = new FirebaseAuthBackend(config);
    }
    return _fireBaseBackend;
}

/**
 * Returns the firebase backend
 */
const getFirebaseBackend = () => {
    return _fireBaseBackend;
}

/**
 * Returns the currentUser
 */
 const getFirebaseCurrentUser = () => {
    return (firebase.auth().currentUser);
}








export { initFirebaseBackend, getFirebaseBackend, getFirebaseCurrentUser };