// Constants
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours
const FETCH_DELAY = 5000 // 5 seconds between requests
const MEMBERS_PER_BATCH = 10 // Load 10 members at a time

// DOM Elements
const setupScreen = document.getElementById("setupScreen")
const dataScreen = document.getElementById("dataScreen")
const factionIdInput = document.getElementById("factionIdInput")
const apiKeyInput = document.getElementById("apiKeyInput")
const saveKeyBtn = document.getElementById("saveKeyBtn")
const logoutBtn = document.getElementById("logoutBtn")
const statusText = document.getElementById("statusText")
const loadingIndicator = document.getElementById("loadingIndicator")
const membersTableBody = document.getElementById("membersTableBody")
const tableContainer = document.getElementById("tableContainer")
const errorContainer = document.getElementById("errorContainer")
const controls = document.getElementById("controls")
const reloadAllBtn = document.getElementById("reloadAllBtn")
const memberCount = document.getElementById("memberCount")
const scrollSentinel = document.getElementById("scrollSentinel")
const searchInput = document.getElementById("searchInput")
const filterSelect = document.getElementById("filterSelect")
const sortSelect = document.getElementById("sortSelect")

// State
let allMembers = []
let memberDataCache = {}
let currentBatchIndex = 0
let isLoadingBatch = false
let observer = null
let filteredMembers = []
let currentSearchTerm = ""
let currentFilter = "all"
let currentSort = "none"
let allDataLoaded = false

// Utility Functions
function getApiKey() {
  return localStorage.getItem("tornApiKey")
}

function saveApiKey(key) {
  localStorage.setItem("tornApiKey", key)
}

function getFactionId() {
  return localStorage.getItem("tornFactionId")
}

function saveFactionId(id) {
  localStorage.setItem("tornFactionId", id)
}

function clearSettings() {
  localStorage.removeItem("tornApiKey")
  localStorage.removeItem("tornFactionId")
  localStorage.removeItem("tornMembersData")
  localStorage.removeItem("tornMemberDataCache")
}

function getCachedData() {
  const cached = localStorage.getItem("tornMembersData")
  if (!cached) return null

  const { data, timestamp } = JSON.parse(cached)
  const now = Date.now()

  if (now - timestamp > CACHE_DURATION) {
    localStorage.removeItem("tornMembersData")
    return null
  }

  return data
}

function setCachedData(data) {
  const cacheObject = {
    data,
    timestamp: Date.now(),
  }
  localStorage.setItem("tornMembersData", JSON.stringify(cacheObject))
}

function getMemberDataCache() {
  const cached = localStorage.getItem("tornMemberDataCache")
  if (!cached) return {}

  const { data, timestamp } = JSON.parse(cached)
  const now = Date.now()

  if (now - timestamp > CACHE_DURATION) {
    localStorage.removeItem("tornMemberDataCache")
    return {}
  }

  return data
}

function setMemberDataCache(cache) {
  const cacheObject = {
    data: cache,
    timestamp: Date.now(),
  }
  localStorage.setItem("tornMemberDataCache", JSON.stringify(cacheObject))
}

function showError(message) {
  errorContainer.innerHTML = `<div class="error">${message}</div>`
}

function clearError() {
  errorContainer.innerHTML = ""
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// API Functions
async function fetchWithAuth(url, apiKey) {
  const response = await fetch(url, {
    headers: {
      Authorization: `ApiKey ${apiKey}`,
      accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchFactionMembers(apiKey, factionId) {
  const url = `https://api.torn.com/v2/faction/${factionId}/members?striptags=true`
  return fetchWithAuth(url, apiKey)
}

async function fetchUserReviveSkill(userId, apiKey) {
  const url = `https://api.torn.com/v2/user/${userId}/personalstats?stat=reviveskill&comment=ReviveSkillTracking`
  return fetchWithAuth(url, apiKey)
}

async function fetchUserProfile(userId, apiKey) {
  const url = `https://api.torn.com/v2/user/${userId}/profile?striptags=true`
  return fetchWithAuth(url, apiKey)
}

async function fetchSingleMemberData(memberId, apiKey) {
  try {
    const [reviveData, profileData] = await Promise.all([
      fetchUserReviveSkill(memberId, apiKey),
      fetchUserProfile(memberId, apiKey),
    ])

    let reviveSkill = 1
    if (reviveData.personalstats && Array.isArray(reviveData.personalstats)) {
      const reviveSkillData = reviveData.personalstats.find((stat) => stat.name === "reviveskill")
      if (reviveSkillData && reviveSkillData.value !== undefined) {
        reviveSkill = reviveSkillData.value
      }
    }

    return {
      reviveSkill,
      profile: profileData.profile,
    }
  } catch (error) {
    console.error(`Error fetching data for member ${memberId}:`, error)
    return {
      reviveSkill: "Error",
      profile: null,
    }
  }
}

// Display Functions
function createMemberRow(member, data = null) {
  const row = document.createElement("tr")
  row.id = `member-${member.id}`

  if (!data) {
    row.classList.add("loading")
  }

  let profileImage = data?.profile?.image || "https://www.torn.com/images/v2/default-avatar.svg"

  if (profileImage === "https://www.torn.com/images/v2/default-avatar.svg" && data?.profile?.gender) {
    const gender = data.profile.gender.toLowerCase()
    if (gender === "male") {
      profileImage = "https://www.torn.com/images/profile_man.jpg"
    } else {
      // Use profile_girl.jpg for female and non-binary
      profileImage = "https://www.torn.com/images/profile_girl.jpg"
    }
  }

  const level = data?.profile?.level || member.level || "N/A"
  const age = data?.profile?.age || "N/A"
  const daysInFaction = member.days_in_faction || "N/A"
  const reviveSkill = data
    ? typeof data.reviveSkill === "number"
      ? data.reviveSkill.toLocaleString()
      : data.reviveSkill
    : "..."

  let reviveClass = ""
  if (typeof data?.reviveSkill === "number") {
    const skill = data.reviveSkill
    if (skill === 100) reviveClass = "skill-100"
    else if (skill >= 90) reviveClass = "skill-90-99"
    else if (skill >= 75) reviveClass = "skill-75-90"
    else if (skill >= 50) reviveClass = "skill-50-75"
    else if (skill >= 26) reviveClass = "skill-26-50"
    else reviveClass = "skill-0-25"
  }

  const profileUrl = `https://www.torn.com/profiles.php?XID=${member.id}`

  row.innerHTML = `
    <td>
      <div class="member-cell">
        <img src="${profileImage}" alt="${member.name}" class="member-avatar" />
        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="member-name">${member.name}</a>
      </div>
    </td>
    <td>
      <span class="position-badge">${member.position || "Member"}</span>
    </td>
    <td>
      <span class="revive-skill-cell ${reviveClass}">${reviveSkill}</span>
    </td>
    <td>
      <span class="stat-cell">${level}</span>
    </td>
    <td>
      <span class="stat-cell">${age}</span>
    </td>
    <td>
      <span class="stat-cell">${daysInFaction}</span>
    </td>
    <td>
      <button class="reload-btn" onclick="reloadSingleMember(${member.id}, '${member.name}')">Reload</button>
    </td>
  `

  return row
}

function applyFiltersAndSort() {
  // Start with all members
  let result = [...allMembers]

  // Apply search filter
  if (currentSearchTerm) {
    result = result.filter((member) => member.name.toLowerCase().includes(currentSearchTerm.toLowerCase()))
  }

  // Apply skill level filter
  if (currentFilter !== "all") {
    result = result.filter((member) => {
      const data = memberDataCache[member.id]
      if (!data || typeof data.reviveSkill !== "number") return false

      const skill = data.reviveSkill
      if (currentFilter === "0-75") return skill >= 0 && skill <= 75
      if (currentFilter === "75-99") return skill >= 75 && skill <= 99
      if (currentFilter === "100") return skill === 100
      return true
    })
  }

  // Apply sorting
  if (currentSort !== "none") {
    result.sort((a, b) => {
      if (currentSort === "revive-asc" || currentSort === "revive-desc") {
        const aData = memberDataCache[a.id]
        const bData = memberDataCache[b.id]
        const aSkill = aData && typeof aData.reviveSkill === "number" ? aData.reviveSkill : 0
        const bSkill = bData && typeof bData.reviveSkill === "number" ? bData.reviveSkill : 0
        return currentSort === "revive-asc" ? aSkill - bSkill : bSkill - aSkill
      }
      if (currentSort === "days-asc" || currentSort === "days-desc") {
        const aDays = a.days_in_faction || 0
        const bDays = b.days_in_faction || 0
        return currentSort === "days-asc" ? aDays - bDays : bDays - aDays
      }
      return 0
    })
  }

  filteredMembers = result
  return result
}

function refreshDisplay() {
  const filtered = applyFiltersAndSort()
  membersTableBody.innerHTML = ""
  currentBatchIndex = 0

  // Update member count
  memberCount.textContent = `Showing ${filtered.length} of ${allMembers.length} members`

  // Load first batch of filtered results
  loadNextBatch()
}

async function loadNextBatch() {
  if (isLoadingBatch || currentBatchIndex >= filteredMembers.length) {
    return
  }

  isLoadingBatch = true
  const apiKey = getApiKey()

  const startIndex = currentBatchIndex
  const endIndex = Math.min(startIndex + MEMBERS_PER_BATCH, filteredMembers.length)
  const batch = filteredMembers.slice(startIndex, endIndex)

  // Add placeholder rows
  for (const member of batch) {
    const row = createMemberRow(member, null)
    membersTableBody.appendChild(row)
  }

  // Fetch data for each member in the batch
  for (let i = 0; i < batch.length; i++) {
    const member = batch[i]

    if (!memberDataCache[member.id]) {
      statusText.textContent = `Loading ${member.name}... (${startIndex + i + 1}/${filteredMembers.length})`
      const memberData = await fetchSingleMemberData(member.id, apiKey)
      memberDataCache[member.id] = memberData
      setMemberDataCache(memberDataCache)

      if (i < batch.length - 1) {
        await delay(FETCH_DELAY)
      }
    }

    // Update the row with actual data
    const data = memberDataCache[member.id]
    const row = document.getElementById(`member-${member.id}`)
    if (row) {
      const newRow = createMemberRow(member, data)
      row.replaceWith(newRow)
    }
  }

  currentBatchIndex = endIndex
  updateMemberCount()

  statusText.textContent = `Loaded ${currentBatchIndex} of ${filteredMembers.length} members`

  if (currentBatchIndex >= allMembers.length) {
    allDataLoaded = true
    setControlsEnabled(true)
    statusText.textContent = `All ${allMembers.length} members loaded - Ready to search, filter, and sort`
  }

  isLoadingBatch = false
}

function updateMemberCount() {
  memberCount.textContent = `Showing ${currentBatchIndex} of ${filteredMembers.length} members (${allMembers.length} total)`
}

async function loadFactionMembers(apiKey, factionId) {
  try {
    clearError()
    loadingIndicator.style.display = "block"
    membersTableBody.innerHTML = ""
    controls.style.display = "none"
    tableContainer.style.display = "none"
    allDataLoaded = false

    statusText.textContent = "Fetching faction members..."
    const factionData = await fetchFactionMembers(apiKey, factionId)
    const members = factionData.members || []

    allMembers = members
    filteredMembers = members
    memberDataCache = getMemberDataCache()
    currentBatchIndex = 0

    setCachedData(members)

    loadingIndicator.style.display = "none"
    controls.style.display = "flex"
    tableContainer.style.display = "block"

    setControlsEnabled(false)

    updateMemberCount()
    setupInfiniteScroll()
    await loadNextBatch()
  } catch (error) {
    console.error("Error loading data:", error)
    showError(`Failed to load data: ${error.message}`)
    loadingIndicator.style.display = "none"
    statusText.textContent = "Error loading data"
  }
}

async function reloadAllMemberData(apiKey) {
  try {
    clearError()
    loadingIndicator.style.display = "block"
    controls.style.display = "none"
    tableContainer.style.display = "none"
    allDataLoaded = false

    statusText.textContent = `Reloading data for ${allMembers.length} members...`

    memberDataCache = {}
    membersTableBody.innerHTML = ""
    currentBatchIndex = 0
    filteredMembers = [...allMembers]

    loadingIndicator.style.display = "none"
    controls.style.display = "flex"
    tableContainer.style.display = "block"

    setControlsEnabled(false)

    await loadNextBatch()
  } catch (error) {
    console.error("Error reloading all data:", error)
    showError(`Failed to reload data: ${error.message}`)
    loadingIndicator.style.display = "none"
    controls.style.display = "flex"
    tableContainer.style.display = "block"
  }
}

async function reloadSingleMember(memberId, memberName) {
  const apiKey = getApiKey()
  if (!apiKey) return

  try {
    statusText.textContent = `Reloading ${memberName}...`

    const memberData = await fetchSingleMemberData(memberId, apiKey)

    memberDataCache[memberId] = memberData
    setMemberDataCache(memberDataCache)

    // Update the row
    const member = allMembers.find((m) => m.id === memberId)
    if (member) {
      const row = document.getElementById(`member-${memberId}`)
      if (row) {
        const newRow = createMemberRow(member, memberData)
        row.replaceWith(newRow)
      }
    }

    statusText.textContent = `${memberName} reloaded at ${new Date().toLocaleString()}`
  } catch (error) {
    console.error(`Error reloading ${memberName}:`, error)
    showError(`Failed to reload ${memberName}: ${error.message}`)
  }
}

// Infinite Scroll
function setupInfiniteScroll() {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingBatch && currentBatchIndex < filteredMembers.length) {
          loadNextBatch()
        }
      })
    },
    {
      rootMargin: "200px",
    },
  )

  observer.observe(scrollSentinel)
}

function setControlsEnabled(enabled) {
  searchInput.disabled = !enabled
  filterSelect.disabled = !enabled
  sortSelect.disabled = !enabled

  if (enabled) {
    searchInput.classList.remove("disabled")
    filterSelect.classList.remove("disabled")
    sortSelect.classList.remove("disabled")
  } else {
    searchInput.classList.add("disabled")
    filterSelect.classList.add("disabled")
    sortSelect.classList.add("disabled")
  }
}

// Event Handlers
saveKeyBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim()
  const factionId = factionIdInput.value.trim()

  if (!apiKey) {
    showError("Please enter an API key")
    return
  }

  if (!factionId) {
    showError("Please enter a Faction ID")
    return
  }

  saveApiKey(apiKey)
  saveFactionId(factionId)
  setupScreen.style.display = "none"
  dataScreen.classList.add("active")

  const cachedData = getCachedData()
  if (cachedData) {
    allMembers = cachedData
    filteredMembers = cachedData
    memberDataCache = getMemberDataCache()
    currentBatchIndex = 0

    controls.style.display = "flex"
    tableContainer.style.display = "block"
    loadingIndicator.style.display = "none"

    updateMemberCount()
    setupInfiniteScroll()
    await loadNextBatch()

    const cacheInfo = JSON.parse(localStorage.getItem("tornMembersData"))
    const cacheDate = new Date(cacheInfo.timestamp)
    statusText.textContent = `Loaded from cache (${cacheDate.toLocaleString()})`
  } else {
    await loadFactionMembers(apiKey, factionId)
  }
})

logoutBtn.addEventListener("click", () => {
  clearSettings()
  dataScreen.classList.remove("active")
  setupScreen.style.display = "block"
  apiKeyInput.value = ""
  factionIdInput.value = ""
  membersTableBody.innerHTML = ""
  clearError()
  allMembers = []
  filteredMembers = []
  memberDataCache = {}
  currentBatchIndex = 0
  allDataLoaded = false

  if (observer) {
    observer.disconnect()
    observer = null
  }
})

reloadAllBtn.addEventListener("click", async () => {
  const apiKey = getApiKey()
  if (apiKey) {
    await reloadAllMemberData(apiKey)
  }
})

searchInput.addEventListener("input", (e) => {
  if (!allDataLoaded) return
  currentSearchTerm = e.target.value
  refreshDisplay()
})

filterSelect.addEventListener("change", (e) => {
  if (!allDataLoaded) return
  currentFilter = e.target.value
  refreshDisplay()
})

sortSelect.addEventListener("change", (e) => {
  if (!allDataLoaded) return
  currentSort = e.target.value
  refreshDisplay()
})

// Make reloadSingleMember globally accessible
window.reloadSingleMember = reloadSingleMember

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  const savedKey = getApiKey()
  const savedFactionId = getFactionId()

  if (savedKey && savedFactionId) {
    setupScreen.style.display = "none"
    dataScreen.classList.add("active")

    const cachedData = getCachedData()
    if (cachedData) {
      allMembers = cachedData
      filteredMembers = cachedData
      memberDataCache = getMemberDataCache()
      currentBatchIndex = 0

      controls.style.display = "flex"
      tableContainer.style.display = "block"
      loadingIndicator.style.display = "none"

      const allMembersCached = cachedData.every((member) => memberDataCache[member.id])
      if (allMembersCached) {
        allDataLoaded = true
        setControlsEnabled(true)
      } else {
        setControlsEnabled(false)
      }

      updateMemberCount()
      setupInfiniteScroll()
      loadNextBatch()

      const cacheInfo = JSON.parse(localStorage.getItem("tornMembersData"))
      const cacheDate = new Date(cacheInfo.timestamp)
      statusText.textContent = `Loaded from cache (${cacheDate.toLocaleString()})`
    } else {
      loadFactionMembers(savedKey, savedFactionId)
    }
  }
})
