document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    let cryptoData = [];
    const coinTableBody = document.getElementById("coinTableBody");

    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            cryptoData = await response.json();
            renderFavorites();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function renderFavorites() {
        coinTableBody.innerHTML = "";
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const favoriteCoins = cryptoData.filter(coin => favorites.includes(coin.id));
        favoriteCoins.forEach((coin, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${coin.image}" alt="${coin.name} icon"></td>
                <td class="coin-name" data-id="${coin.id}">${coin.name}</td>
                <td>$${coin.current_price}</td>
                <td>$${coin.total_volume.toLocaleString()}</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
                <td><button class="view-details-btn" data-id="${coin.id}">View Details</button></td>
            `;
            coinTableBody.appendChild(row);
        });
    }

    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("view-details-btn") || event.target.classList.contains("coin-name")) {
            const coinId = event.target.getAttribute("data-id");
            const coin = cryptoData.find(c => c.id === coinId);
            displayCoinDetails(coin);
            await displayPriceChart(coinId);
        }
    });

    async function displayPriceChart(coinId) {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`);
        const data = await response.json();
        const ctx = document.getElementById("priceChart").getContext("2d");
        document.getElementById("priceChart").style.display = 'block';

        // Clear any existing chart instance
        if (window.priceChart) {
            window.priceChart.destroy();
        }

        window.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.prices.map(price => new Date(price[0]).toLocaleDateString()),
                datasets: [{
                    label: 'Price',
                    data: data.prices.map(price => price[1]),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }
                }
            }
        });
    }

    function displayCoinDetails(coin) {
        const detailsDiv = document.getElementById("coinDetails");
        detailsDiv.style.display = "block";
        detailsDiv.innerHTML = `
            <h2>${coin.name}</h2>
            <p>Current Price: $${coin.current_price}</p>
            <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
            <p>Total Volume: $${coin.total_volume.toLocaleString()}</p>
        `;
    }

    fetchData();
});
