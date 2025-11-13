export function renderHtml(data: any) {
  const { lists, rankings, historicalData, selectedBrand } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>iGaming Affiliate Tracker</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
    
      <body>
        <header>
          <h1>iGaming Affiliate Tracker</h1>
        </header>
        <main>
          ${lists.map(list => `
            <h2>${list.name}</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Brand</th>
                  <th>Rating</th>
                  <th>Bonus Offer</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                ${rankings.filter(r => r.list_id === list.id).map(item => `
                  <tr>
                    <td>${item.rank}</td>
                    <td>${item.brand_name}</td>
                    <td>${item.rating}</td>
                    <td>${item.bonus_offer}</td>
                    <td>${getRankChangeSymbol(item.rank_change)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}

          <h2>Brand Rank History</h2>
          <form>
            <label for="brand">Select a brand:</label>
            <select name="brand" id="brand" onchange="this.form.submit()">
              ${[...new Map(rankings.map(item => [item.brand_id, item.brand_name])).entries()].map(([brand_id, brand_name]) => `<option value="${brand_id}" ${brand_id == selectedBrand ? 'selected' : ''}>${brand_name}</option>`).join('')}
            </select>
          </form>
          <canvas id="rankChart"></canvas>
        </main>
        <script>
          const ctx = document.getElementById('rankChart');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(historicalData.map(d => new Date(d.scraped_at).toLocaleDateString()))},
              datasets: [{
                label: 'Rank',
                data: ${JSON.stringify(historicalData.map(d => d.rank))},
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  reverse: true
                }
              }
            }
          });
        </script>
      </body>
    </html>
  `;
}

function getRankChangeSymbol(change: number | null) {
    if (change === null) {
        return '🆕';
    }
    if (change > 0) {
        return `<span style="color: green;">⬆️ ${change}</span>`;
    }
    if (change < 0) {
        return `<span style="color: red;">⬇️ ${Math.abs(change)}</span>`;
    }
    return '➖';
}
