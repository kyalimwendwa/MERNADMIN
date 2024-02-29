
function calculatedTotalRevenue(orders) {
  let calculatedTotalRevenue = 0;
  for (const order of orders) {
    calculatedTotalRevenue += parseFloat(order.totalprice);
  }
  return calculatedTotalRevenue.toFixed(2);
}

module.exports = calculatedTotalRevenue;
