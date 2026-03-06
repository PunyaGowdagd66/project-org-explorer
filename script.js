console.log("JS Connected Successfully");
let currentPage = 1;
const reposPerPage = 5;
currentPage = 1;

async function fetchOrg() {
    const orgName = document.getElementById("orgInput").value.trim();
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "<p>Loading organization data...</p>";

    if (!orgName) {
        resultDiv.innerHTML = "<p>Please enter an organization name.</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Loading organization data...</p>";

    try {
        // Fetch org info
        const orgResponse = await fetch(`https://api.github.com/orgs/${orgName}`);
        
        if (!orgResponse.ok) {
            resultDiv.innerHTML = "<p>Organization not found.</p>";
            return;
        }

        const orgData = await orgResponse.json();
        
      
        // Fetch repos
        const repoResponse = await fetch(`https://api.github.com/orgs/${orgName}/repos?per_page=100`);
        const repoData = await repoResponse.json();

        let totalStars = 0;
        let languageCount = {};
        const sortOption = document.getElementById("sortOption").value;

    let sortedRepos;

    if (sortOption === "stars") {
        sortedRepos = repoData.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else {
        sortedRepos = repoData.sort((a, b) => b.forks_count - a.forks_count);
    }
    // Pagination Logic
    const start = (currentPage - 1) * reposPerPage;
    const end = start + reposPerPage;

    const paginatedRepos = sortedRepos.slice(start, end);


        repoData.forEach(repo => {
            totalStars += repo.stargazers_count;
  

            if (repo.language) {
                languageCount[repo.language] =
                    (languageCount[repo.language] || 0) + 1;
            }
        });

        // Insert HTML FIRST
        resultDiv.innerHTML = `
            <h2>${orgData.login}</h2>
            //
            <img src="${orgData.avatar_url}" width="100" style="border-radius:50%; margin:10px 0;">
        <p>${orgData.description || "No description available."}</p>
        <p>
        <a href="${orgData.html_url}" target="_blank">
        View on GitHub
         </a>
        </p>
            <div class="stats">
        <div class="card">
            <h3>${orgData.public_repos}</h3>
            <p>Repositories</p>
        </div>

        <div class="card">
            <h3>${orgData.followers}</h3>
            <p>Followers</p>
        </div>

        <div class="card">
            <h3>${totalStars}</h3>
            <p>Total Stars</p>
        </div>
        </div>
            <p>Public Repos: ${orgData.public_repos}</p>
            <p>Total Stars: ${totalStars}</p>
             <h3>Language Distribution</h3>
            <canvas id="languageChart"></canvas>
            <h3>Top 5 Repositories by Stars</h3>
            <canvas id="topReposChart"></canvas>

        <div style="margin-top:20px;">
        <button onclick="prevPage()">⬅ Previous</button>
        <span> Page ${currentPage} </span>
        <button onclick="nextPage()">Next ➡</button>
        </div>

        <h3>Top Contributors</h3>
        <div id="contributorsList"></div>

        <h3>Repository List</h3>
        <div id="repoList"></div>
        `;

        fetchTopContributors(orgName);


        // THEN create chart
        const ctx = document.getElementById("languageChart").getContext("2d");

        new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(languageCount),
                datasets: [{
                    data: Object.values(languageCount)
                }]
            },
            options: {
                responsive: true
            }
        });
        const repoNames = sortedRepos.map(repo => repo.name);
        const repoStars = sortedRepos.map(repo => repo.stargazers_count);

        const ctx2 = document.getElementById("topReposChart").getContext("2d");


        new Chart(ctx2, {
    type: "bar",
    data: {
        labels: paginatedRepos.map(repo => repo.name),
        datasets: [{
            label: sortOption === "stars" ? "Stars" : "Forks",
            data: paginatedRepos.map(repo =>
                sortOption === "stars"
                    ? repo.stargazers_count
                    : repo.forks_count
            )
        }]
    },
    options: {
        responsive: true
    }
    });
    // 🔥 RENDER CLICKABLE REPO LIST
const repoListDiv = document.getElementById("repoList");

repoListDiv.innerHTML = "";

paginatedRepos.forEach(repo => {
    const repoItem = document.createElement("div");

    repoItem.innerHTML = `
        <p style="cursor:pointer; color:blue; margin:5px 0;">
            ${repo.name}
        </p>
    `;

    repoItem.addEventListener("click", () => {
    toggleRepoDetails(repoItem, repo);
    });

    repoListDiv.appendChild(repoItem);
});
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `
        <div class="error-box">
        <h3>⚠ Organization Not Found</h3>
        <p>Please check the name and try again.</p>
        </div>
    `;
    }
}
function nextPage() {
    currentPage++;
    fetchOrg();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchOrg();
    }
}
function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("dark-mode")) {
        btn.innerText = "☀ Light Mode";
    } else {
        btn.innerText = "🌙 Dark Mode";
    }
}
function openRepoModal(repo) {
    const modal = document.getElementById("repoModal");
    const modalBody = document.getElementById("modalBody");

    modalBody.innerHTML = `
        <h2>${repo.name}</h2>
        <p>${repo.description || "No description"}</p>
        <p>⭐ Stars: ${repo.stargazers_count}</p>
        <p>🍴 Forks: ${repo.forks_count}</p>
        <p>🐞 Open Issues: ${repo.open_issues_count}</p>
        <p>🌿 Default Branch: ${repo.default_branch}</p>
        <p>📅 Created: ${new Date(repo.created_at).toLocaleDateString()}</p>
        <p>🔄 Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
        <a href="${repo.html_url}" target="_blank">View on GitHub</a>
    `;

    modal.style.display = "block";
}
document.getElementById("closeModal").onclick = function() {
    document.getElementById("repoModal").style.display = "none";
};

window.onclick = function(event) {
    const modal = document.getElementById("repoModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
function toggleRepoDetails(repoItem, repo) {

    // If already expanded → collapse
    if (repoItem.querySelector(".repo-details")) {
        repoItem.querySelector(".repo-details").remove();
        return;
    }

    // Collapse other open sections (professional behavior)
    document.querySelectorAll(".repo-details").forEach(el => el.remove());

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("repo-details");

    detailsDiv.innerHTML = `
        <div style="margin-left:15px; padding:10px; border-left:2px solid #ccc;">
            <p>⭐ Stars: ${repo.stargazers_count}</p>
            <p>🍴 Forks: ${repo.forks_count}</p>
            <p>🐞 Open Issues: ${repo.open_issues_count}</p>
            <p>🌿 Default Branch: ${repo.default_branch}</p>
            <p>📅 Created: ${new Date(repo.created_at).toLocaleDateString()}</p>
            <p>🔄 Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
        </div>
    `;

    repoItem.appendChild(detailsDiv);
      // Trigger animation
    setTimeout(() => {
        detailsDiv.classList.add("active");
    }, 10);
}
async function fetchTopContributors(orgName) {

    const contributorsDiv = document.getElementById("contributorsList");

    try {

        const response = await fetch(
            `https://api.github.com/orgs/${orgName}/repos?per_page=5`
        );

        const repos = await response.json();

        contributorsDiv.innerHTML = "";

        for (const repo of repos) {

            const contributorRes = await fetch(repo.contributors_url);
            const contributors = await contributorRes.json();

            contributors.slice(0,2).forEach(user => {

                const userItem = document.createElement("p");

                userItem.innerHTML = `
                <img src="${user.avatar_url}" width="30" style="border-radius:50%; vertical-align:middle;">
                ${user.login}
                `;

                contributorsDiv.appendChild(userItem);

            });

        }

    } catch (error) {

        contributorsDiv.innerHTML = "Could not load contributors";

    }
}
async function getTotalStars(org) {
    const res = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`);
    const repos = await res.json();

    let stars = 0;

    repos.forEach(repo => {
        stars += repo.stargazers_count;
    });

    return stars;
}
async function compareOrgs() {

    const org1 = document.getElementById("orgInput1").value.trim();
    const org2 = document.getElementById("orgInput2").value.trim();

    if (!org1 || !org2) {
        alert("Please enter two organizations");
        return;
    }

    try {

        const res1 = await fetch(`https://api.github.com/orgs/${org1}`);
        const res2 = await fetch(`https://api.github.com/orgs/${org2}`);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const stars1 = await getTotalStars(org1);
        const stars2 = await getTotalStars(org2);

        const ctx = document.getElementById("compareChart").getContext("2d");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Repositories", "Followers"],
                datasets: [
                    {
                        label: org1,
                        data: [data1.public_repos, data1.followers]
                    },
                    {
                        label: org2,
                        data: [data2.public_repos, data2.followers]
                    }
                ]
            },
            options: {
                responsive: true
            }
        });

    } catch (error) {
        console.error("Comparison failed");
    }
}