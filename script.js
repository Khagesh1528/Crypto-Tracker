document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    let cryptoData = [];
    let currentPage = 1;
    const rowsPerPage = 10;
    const tableBody = document.querySelector("#cryptoTable tbody");
    const paginationDiv = document.getElementById("pagination");
    const searchInput = document.getElementById("search");
  
    async function fetchData() {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        cryptoData = await response.json();
        renderTable();
        renderPagination();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    function renderTable() {
      tableBody.innerHTML = "";
      let filteredData = cryptoData.filter(coin =>
        coin.name.toLowerCase().includes(searchInput.value.toLowerCase())
      );
      let paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  
      paginatedData.forEach(coin => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><img src="${coin.image}" alt="${coin.name} icon">   ${coin.name}</td>
          <td>$ ${coin.current_price.toLocaleString()}</td>
          <td>$ ${coin.total_volume.toLocaleString()}</td>
          <td>$ ${coin.market_cap.toLocaleString()}</td>
          <td><button class="favorite-btn" data-id="${coin.id}">${isFavorite(coin.id) ? "★" : "☆"}</button></td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    function renderPagination() {
      paginationDiv.innerHTML = "";
      const totalPages = Math.ceil(cryptoData.length / rowsPerPage);
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.addEventListener("click", () => {
          currentPage = i;
          renderTable();
        });
        paginationDiv.appendChild(btn);
      }
    }
  
    function isFavorite(coinId) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      return favorites.includes(coinId);
    }
  
    function toggleFavorite(coinId) {
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (favorites.includes(coinId)) {
        favorites = favorites.filter(id => id !== coinId);
      } else {
        favorites.push(coinId);
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderTable();
    }
  
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("favorite-btn")) {
        const coinId = event.target.getAttribute("data-id");
        toggleFavorite(coinId);
      }
    });
  
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderTable();
    });
  
    document.getElementById("sortPrice").addEventListener("click", () => {
      cryptoData.sort((a, b) => a.current_price - b.current_price);
      renderTable();
    });
  
    document.getElementById("sortVolume").addEventListener("click", () => {
      cryptoData.sort((a, b) => a.total_volume - b.total_volume);
      renderTable();
    });
  
    fetchData();
  });
  