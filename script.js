const loadingSpinner = document.getElementById("loadingSpinner");
const addUserBtn = document.getElementById("addUserBtn");
const usernameInput = document.getElementById("usernameInput");
const usersGrid = document.getElementById("usersGrid");
const emptyState = document.getElementById("emptyState");
const trackedUsers = [];

// Update the user count display
function updateUserCount() {
  const userCountElement = document.getElementById("userCount");
  const count = trackedUsers.length;
  userCountElement.textContent = `${count} user${count !== 1 ? "s" : ""}`;
}

// Add user button click event
addUserBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  console.log("Github username entered:", username);

  if (username === "") {
    alert("Please enter a Github username");
    return;
  }

  if (trackedUsers.includes(username.toLowerCase())) {
    alert("User already added!");
    return;
  }

  console.log("Username valid, proceeding...");
  loadingSpinner.style.display = "flex";

  // Fetch GitHub user data
  fetch(`https://api.github.com/users/${username}`)
    .then(response => response.json())
    .then(data => {
      loadingSpinner.style.display = "none";

      if (data.message === "Not Found") {
        alert("Github user not found!");
        return;
      }

      trackedUsers.push(username.toLowerCase());
      updateUserCount();

      console.log("Github user data:", data);

      // Create user card
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

      emptyState.style.display = "none";
      usersGrid.appendChild(userCard);
      // Find the remove button inside the card
const removeBtn = userCard.querySelector(".remove-btn");

removeBtn.addEventListener("click", () => {
  if (!confirm(`Remove ${data.login}?`)) {
    return;
  }

  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    // Delete from Firestore
    db.collection("users")
      .doc(currentUser.uid)
      .collection("tracked")
      .doc(data.login.toLowerCase())
      .delete()
      .then(() => {
        console.log(`${data.login} removed from Firestore`);

        // Remove from DOM
        usersGrid.removeChild(userCard);

        // Remove from trackedUsers array
        const index = trackedUsers.indexOf(data.login.toLowerCase());
        if (index > -1) {
          trackedUsers.splice(index, 1);
        }

        updateUserCount();

        // Show empty state if no users remain
        if (trackedUsers.length === 0) {
          emptyState.style.display = "flex";
        }
      })
      .catch((error) => {
        console.error("Error removing user:", error);
        alert("Error removing user. Check console.");
      });
  }
});


      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        db.collection("users")
          .doc(user.uid)
          .collection("tracked")
          .doc(data.login.toLowerCase())
          .set({
            login: data.login,
            avatar_url: data.avatar_url,
            bio: data.bio,
            public_repos: data.public_repos,
            followers: data.followers,
            following: data.following,
            html_url: data.html_url
          })
          .then(() => {
            console.log("User saved to Firestore");
          })
          .catch(error => {
            console.error("Error saving user to Firestore:", error);
          });
      }
    })
    .catch(error => {
      loadingSpinner.style.display = "none";
      alert("Error fetching data. Please try again.");
      console.error(error);
    });
});
