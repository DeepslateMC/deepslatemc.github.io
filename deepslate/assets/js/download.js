$(document).ready(function () {
  var repoOwner = "DeepslateMC";
  var repoName = "Deepslate";
  var releasesApiUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/releases";
  var latestReleaseApiUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/releases/latest";

  // Function to load releases
  function loadReleases() {
    $.getJSON(latestReleaseApiUrl, function (latestRelease) {
      var latestReleaseData = {
        name: latestRelease.name,
        description: latestRelease.body,
        downloadUrl: latestRelease.assets.length > 0 ? latestRelease.assets[0].browser_download_url : null,
        isPrerelease: latestRelease.prerelease,
        commitHash: "",
      };

      // Fetch commit hash for latest release
      fetchCommitHash(latestReleaseData, function (releaseWithCommitHash) {
        displayLatestRelease(releaseWithCommitHash);
      });

      // Fetch all releases
      $.getJSON(releasesApiUrl, function (data) {
        var releases = data.map(function (release) {
          return {
            name: release.name,
            description: release.body,
            downloadUrl: release.assets.length > 0 ? release.assets[0].browser_download_url : null,
            isPrerelease: release.prerelease,
            commitHash: "",
          };
        });

        // Sort releases by published date (latest first)
        releases.sort(function (a, b) {
          return new Date(b.published_at) - new Date(a.published_at);
        });

        // Fetch commit hash for each release
        fetchCommitHashes(releases, function (releasesWithCommitHashes) {
          displayReleases(releasesWithCommitHashes);
        });
      });
    });
  }

  // Function to fetch commit hash for a release
  function fetchCommitHash(release, callback) {
    var tagsApiUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/tags";

    $.getJSON(tagsApiUrl, function (data) {
      if (data.length > 0) {
        var tag = data[0];
        var commitHash = tag.commit.sha.slice(0, 7); // Get the first 7 characters of the commit hash
        release.commitHash = commitHash;
      }

      callback(release);
    });
  }

  // Function to fetch commit hashes for multiple releases
  function fetchCommitHashes(releases, callback) {
    var completedRequests = 0;

    releases.forEach(function (release, index) {
      fetchCommitHash(release, function (releaseWithCommitHash) {
        releases[index] = releaseWithCommitHash;
        completedRequests++;

        if (completedRequests === releases.length) {
          callback(releases);
        }
      });
    });
  }

  // Function to display latest release
  function displayLatestRelease(release) {
    var releaseTitle = release.name;
    var releaseHash = `"${release.commitHash}"`;

    var releaseHTML = `
      <div class="release-item">
        <!--<p class="commit-hash"><i class="fas fa-check"></i> git-Fork-${releaseHash}</p>-->
        <p class="commit-hash"><i class="fas fa-check-circle"></i> Stable Build</p>
        <h3 class="release-title">${releaseTitle}</h3>
        <!--<p class="release-description">${release.description}</p>-->
        <a href="${release.downloadUrl}" class="download-button">Download</a>
        <span class="button-space"></span>
        <a href="https://github.com/DeepslateMC/Deepslate/releases/latest" class="download-button">Release Notes</a>
      </div>
    `;
    $("#latest-downloads").append(releaseHTML);
  }

  // Function to display releases
  function displayReleases(releases) {
    // Display experimental releases
    var experimentalReleases = releases.filter(function (release) {
      return release.isPrerelease;
    });

    experimentalReleases.forEach(function (release) {
      var releaseTitle = release.name;
      var releaseHash = `"${release.commitHash}"`;

      var releaseHTML = `
        <div class="release-item">
          <p class="commit-hash-experimental"><i class="fas fa-exclamation-triangle"></i> git-Fork-${releaseHash}</p>
          <h3 class="release-title">${releaseTitle}</h3>
          <!--<p class="release-description">${release.description}</p>-->
          <a href="${release.downloadUrl}" class="download-button">Download</a>
        </div>
      `;
      $("#experimental-downloads").append(releaseHTML);
    });
  }

  loadReleases();

  // Tab click event handlers
  $(".tab").on("click", function () {
    var tabId = $(this).attr("id");
    $(".tab").removeClass("active");
    $(this).addClass("active");
    $(".content").hide();
    $("#" + tabId.replace("-tab", "-content")).show();
  });
});
