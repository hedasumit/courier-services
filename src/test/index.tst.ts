import { calculateDeliveryCost, applyOffer, scheduleDeliveries } from "../index";

describe("Courier Service", () => {
  test("should correctly calculate delivery cost", () => {
    expect(calculateDeliveryCost(100, 5, 5)).toBe(175); // 100 + 5*10 + 5*5
    expect(calculateDeliveryCost(100, 10, 100)).toBe(700); // 100 + 10*10 + 100*5
  });

  test("should correctly apply offers", () => {
    const cost1 = calculateDeliveryCost(100, 5, 5);
    const res1 = applyOffer("OFR001", 5, 5, cost1);
    expect(res1.discount).toBe(0);
    expect(res1.totalCost).toBe(175);

    const cost2 = calculateDeliveryCost(100, 10, 100);
    const res2 = applyOffer("OFR003", 10, 100, cost2);
    expect(res2.discount).toBe(35);
    expect(res2.totalCost).toBe(665);
  });

  test("should schedule deliveries with multiple vehicles", () => {
    const packages = [
      { id: "PKG1", weight: 50, distance: 30, discount: 0, totalCost: 750 },
      { id: "PKG2", weight: 75, distance: 125, discount: 0, totalCost: 1475 },
      { id: "PKG3", weight: 175, distance: 100, discount: 0, totalCost: 2350 },
      { id: "PKG4", weight: 110, distance: 60, discount: 105, totalCost: 1395 },
      { id: "PKG5", weight: 155, distance: 95, discount: 0, totalCost: 2125 },
    ];

    const scheduled = scheduleDeliveries(packages, 2, 70, 200);
    // check some known outputs (from PDF example)
    expect(scheduled["PKG1"].deliveryTime).toBeCloseTo(3.29, 2);
    expect(scheduled["PKG2"].deliveryTime).toBeCloseTo(4.5, 2);
    expect(scheduled["PKG3"].deliveryTime).toBeCloseTo(1.43, 2);
    expect(scheduled["PKG4"].deliveryTime).toBeCloseTo(3.57, 2);
    expect(scheduled["PKG5"].deliveryTime).toBeCloseTo(1.36, 2);
  });
});
