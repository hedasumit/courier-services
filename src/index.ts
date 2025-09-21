/**
 * Courier Service - Delivery Cost & Time Estimation
*/

import * as readline from "readline";

// interfaces
interface Offer {
    discount: number;
    minDistance: number;
    maxDistance: number;
    minWeight: number;
    maxWeight: number;
}


interface PackageResult {
    id: string;
    weight: number;
    distance: number;
    discount: number;
    totalCost: number;
    deliveryTime?: number;
}

interface Vehicle {
    availableAt: number;
}

interface OfferMap {
    [code: string]: Offer;
}

// offer configurations
const offers: OfferMap = {
    OFR001: { discount: 0.1, minDistance: 0, maxDistance: 200, minWeight: 70, maxWeight: 200 },
    OFR002: { discount: 0.07, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
    OFR003: { discount: 0.05, minDistance: 50, maxDistance: 250, minWeight: 10, maxWeight: 150 },
};


function calculateDeliveryCost(baseCost: number, weight: number, distance: number): number {
    return baseCost + weight * 10 + distance * 5;
}

function applyOffer(offerCode: string, weight: number, distance: number, deliveryCost: number): { discount: number; totalCost: number } {
    const offer = offers[offerCode];
    if (!offer) return { discount: 0, totalCost: deliveryCost };
    const { discount, minDistance, maxDistance, minWeight, maxWeight } = offer;
    if (weight >= minWeight && weight <= maxWeight && distance >= minDistance && distance <= maxDistance) {
        const discountAmount = deliveryCost * discount;
        return { discount: discountAmount, totalCost: deliveryCost - discountAmount };
    }
    return { discount: 0, totalCost: deliveryCost };
}

function scheduleDeliveries(
    packages: PackageResult[],
    noOfVehicles: number,
    maxSpeed: number,
    maxCarriableWeight: number
): Record<string, { deliveryTime: number }> {
    const vehicles: Vehicle[] = Array.from({ length: noOfVehicles }, () => ({ availableAt: 0 }));

    const results: Record<string, { deliveryTime: number }> = {};

    // Sort packages by (weight desc, distance desc)
    let pending: PackageResult[] = [...packages].sort((a, b) => {
        if (b.weight === a.weight) return b.distance - a.distance;
        return b.weight - a.weight;
    });

    while (pending.length > 0) {
        vehicles.sort((a, b) => a.availableAt - b.availableAt);
        const vehicle = vehicles[0];
        const currentTime = vehicle.availableAt;
        let shipment: PackageResult[] = [];
        let totalWeight = 0;
        for (const pkg of pending) {
            if (totalWeight + pkg.weight <= maxCarriableWeight) {
                shipment.push(pkg);
                totalWeight += pkg.weight;
            }
        }
        if (shipment.length === 0) break;
        const maxDistance = Math.max(...shipment.map((p) => p.distance));
        const travelTime = maxDistance / maxSpeed;
        shipment.forEach((pkg) => {
            results[pkg.id] = { deliveryTime: parseFloat((currentTime + pkg.distance / maxSpeed).toFixed(2)) };
        });
        vehicle.availableAt = currentTime + 2 * travelTime;
        pending = pending.filter((p) => !shipment.includes(p));
    }
    return results;
}

// take inputs from cli
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

let baseCost = 0;
let noOfPackages = 0;
let packages: PackageResult[] = [];
let vehicleParamsRead = false;
let noOfVehicles: number, maxSpeed: number, maxCarriableWeight: number;
let lineCount = 0;

rl.on("line", (line: string) => {
    const parts = line.trim().split(" ");
    if (lineCount === 0) {
        baseCost = parseInt(parts[0], 10);
        noOfPackages = parseInt(parts[1], 10);
    } else if (lineCount <= noOfPackages) {
        const [pkgId, weightStr, distanceStr, offerCode] = parts;
        const weight = parseInt(weightStr, 10);
        const distance = parseInt(distanceStr, 10);
        const deliveryCost = calculateDeliveryCost(baseCost, weight, distance);
        const { discount, totalCost } = applyOffer(offerCode, weight, distance, deliveryCost);
        packages.push({
            id: pkgId,
            weight,
            distance,
            discount: Math.round(discount),
            totalCost: Math.round(totalCost),
        });
    } else if (!vehicleParamsRead) {
        noOfVehicles = parseInt(parts[0], 10);
        maxSpeed = parseInt(parts[1], 10);
        maxCarriableWeight = parseInt(parts[2], 10);
        vehicleParamsRead = true;
        const scheduled = scheduleDeliveries(packages, noOfVehicles, maxSpeed, maxCarriableWeight);
        packages.forEach((p) => {
            const deliveryTime = scheduled[p.id].deliveryTime;
            console.log(`${p.id} ${p.discount} ${p.totalCost} ${deliveryTime}`);
        });
        rl.close();
    }
    lineCount++;
});

export { calculateDeliveryCost, applyOffer, scheduleDeliveries };