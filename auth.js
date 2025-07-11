// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYKzzKVdjDvBrFZ4nLBwIcXBaR8I0i_mg",
  authDomain: "github-stalker-c24ab.firebaseapp.com",
  projectId: "github-stalker-c24ab",
  storageBucket: "github-stalker-c24ab.appspot.com",
  messagingSenderId: "389360685058",
  appId: "1:389360685058:web:4a6552809cf97032d7d71b"
};

firebase.initializeApp(firebaseConfig);

// Now it is safe to initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();


// DOM Elements
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const signUpBtn = document.getElementById('signUpBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnTop = document.getElementById('logoutBtnTop'); // <-- NEW
const authStatus = document.getElementById('authStatus');
const authOverlay = document.getElementById('authOverlay');
const appContainer = document.getElementById('appContainer');

// Sign Up with Email/Password
signUpBtn.addEventListener('click', () => {
  auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
    .then(userCredential => {
      const user = userCredential.user;
      authStatus.textContent = `Signed up as ${user.email}`;
    })
    .catch(error => {
      authStatus.textContent = error.message;
    });
});

// Login with Email/Password
loginBtn.addEventListener('click', () => {
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .then(userCredential => {
      const user = userCredential.user;
      authStatus.textContent = `Logged in as ${user.email}`;
    })
    .catch(error => {
      authStatus.textContent = error.message;
    });
});

// Logout from overlay button
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    authStatus.textContent = "Logged out";
  });
});

// Logout from top-right button
logoutBtnTop.addEventListener('click', () => {
  auth.signOut().then(() => {
    authStatus.textContent = "Logged out";
  });
});

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    // 🧹 Clear any old cards and tracked users to avoid duplicates
    usersGrid.innerHTML = "";
    trackedUsers.length = 0;
    updateUserCount();

    // Load saved tracked users
    db.collection("users")
      .doc(user.uid)
      .collection("tracked")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Loaded saved user:", data);

          const userCard = document.createElement("div");
          userCard.className = "user-card";
          userCard.innerHTML = `
            <div class="user-header">
              <img src="${data.avatar_url}" alt="${data.login}" class="user-avatar">
              <div class="user-info">
                <h3>${data.login}</h3>
                <p>${data.bio || "No bio available"}</p>
              </div>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">${data.public_repos}</span>
                <span class="stat-label">Repos</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${data.followers}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${data.following}</span>
                <span class="stat-label">Following</span>
              </div>
            </div>
            <div class="user-actions">
              <a href="${data.html_url}" target="_blank" class="action-btn visit-btn">
                <i class="fas fa-external-link-alt"></i> Visit Profile
              </a>
              <button class="action-btn remove-btn">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
          `;

          // Add to DOM
          emptyState.style.display = "none";
          usersGrid.appendChild(userCard);

          // Add to tracked users array
          trackedUsers.push(data.login.toLowerCase());

          // Attach remove button listener
          const removeBtn = userCard.querySelector(".remove-btn");
          removeBtn.addEventListener("click", () => {
            if (!confirm(`Remove ${data.login}?`)) return;

            db.collection("users")
              .doc(user.uid)
              .collection("tracked")
              .doc(data.login.toLowerCase())
              .delete()
              .then(() => {
                console.log(`${data.login} removed from Firestore`);
                usersGrid.removeChild(userCard);

                const index = trackedUsers.indexOf(data.login.toLowerCase());
                if (index > -1) trackedUsers.splice(index, 1);
                updateUserCount();

                if (trackedUsers.length === 0) {
                  emptyState.style.display = "flex";
                }
              })
              .catch((error) => {
                console.error("Error removing user:", error);
                alert("Error removing user. Check console.");
              });
          });
        });

        // Update user count
        updateUserCount();
      })
      .catch((error) => {
        console.error("Error loading tracked users:", error);
      });

    // Show UI
    logoutBtn.style.display = "inline-block";
    logoutBtnTop.style.display = "inline-block";
    loginBtn.style.display = "none";
    signUpBtn.style.display = "none";
    authStatus.textContent = `Logged in as ${user.email}`;
    authOverlay.style.display = "none";
    appContainer.style.display = "block";
  } else {
    // Not logged in
    logoutBtn.style.display = "none";
    logoutBtnTop.style.display = "none";
    loginBtn.style.display = "inline-block";
    signUpBtn.style.display = "inline-block";
    authStatus.textContent = "Not logged in";
    authOverlay.style.display = "flex";
    appContainer.style.display = "none";

    // Clean up
    usersGrid.innerHTML = "";
    trackedUsers.length = 0;
    updateUserCount();
  }
});

