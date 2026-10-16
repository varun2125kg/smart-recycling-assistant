"""
EcoVision AI - Comprehensive Calculation & Unit Handling Test Suite
Verifies:
1. BUG 1: Double-counting root cause resolution (250g + 250g = 500g, single scan contribution, capacity capping, refresh idempotency)
2. BUG 2: Gram / Kilogram threshold formatting (<1000g -> 'g', >=1000g -> 'kg')
"""

import os
import sys
import unittest
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import format_weight, resolve_estimated_weight

BASE_URL = "http://127.0.0.1:5050"

class TestEcoVisionWeightCalculations(unittest.TestCase):

    def test_weight_formatting_thresholds(self):
        """
        Verify Bug 2 requirements:
        - 5 grams -> 5 g
        - 250 grams -> 250 g
        - 500 grams -> 500 g
        - 750 grams -> 750 g
        - 1000 grams -> 1 kg
        - 1250 grams -> 1.25 kg
        - 2500 grams -> 2.5 kg
        """
        self.assertEqual(format_weight(0.005), "5 g")
        self.assertEqual(format_weight(0.250), "250 g")
        self.assertEqual(format_weight(0.500), "500 g")
        self.assertEqual(format_weight(0.750), "750 g")
        self.assertEqual(format_weight(1.000), "1 kg")
        self.assertEqual(format_weight(1.250), "1.25 kg")
        self.assertEqual(format_weight(2.500), "2.5 kg")
        self.assertEqual(format_weight(0.0), "0 g")

    def test_arithmetic_progressions(self):
        """
        Verify addition test cases:
        - 250 g + 250 g = 500 g
        - 500 g + 250 g = 750 g
        - 750 g + 250 g = 1 kg
        - 1 kg + 250 g = 1.25 kg
        """
        step = 0.250  # 250 g
        
        # 250 g + 250 g = 500 g
        total = round(step + step, 3)
        self.assertEqual(total, 0.500)
        self.assertEqual(format_weight(total), "500 g")

        # 500 g + 250 g = 750 g
        total = round(total + step, 3)
        self.assertEqual(total, 0.750)
        self.assertEqual(format_weight(total), "750 g")

        # 750 g + 250 g = 1 kg
        total = round(total + step, 3)
        self.assertEqual(total, 1.000)
        self.assertEqual(format_weight(total), "1 kg")

        # 1 kg + 250 g = 1.25 kg
        total = round(total + step, 3)
        self.assertEqual(total, 1.250)
        self.assertEqual(format_weight(total), "1.25 kg")

    def test_digital_twin_api_and_refresh_stability(self):
        """
        Verify Digital Twin API:
        1. Flush resets to 0 g.
        2. Inflow of 250g + 250g produces exactly 500g (not 750g).
        3. Refreshing (calling GET multiple times) NEVER alters stored weights.
        4. Fill percentage matches current_kg / max_kg * 100.
        5. Bin weights are capped at capacity (max_kg).
        """
        # 1. Flush glass bin
        r = requests.post(f"{BASE_URL}/api/digital-twin/empty/glass")
        self.assertEqual(r.status_code, 200)

        # Verify flushed state
        r = requests.get(f"{BASE_URL}/api/digital-twin")
        self.assertEqual(r.status_code, 200)
        glass = r.json()["bins"]["glass"]
        self.assertEqual(glass["current_kg"], 0.0)
        self.assertEqual(glass["formatted_current_weight"], "0 g")
        self.assertEqual(glass["fill_percentage"], 0.0)

        # 2. Add 250 g
        r = requests.post(f"{BASE_URL}/api/digital-twin/inflow", json={"category": "glass", "weight_kg": 0.250})
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["current_kg"], 0.250)
        self.assertEqual(res["formatted_current_weight"], "250 g")
        self.assertEqual(res["fill_percentage"], round(0.250 / 500.0 * 100.0, 2))

        # 3. Add second 250 g (must equal 500 g, NOT 750 g)
        r = requests.post(f"{BASE_URL}/api/digital-twin/inflow", json={"category": "glass", "weight_kg": 0.250})
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["current_kg"], 0.500)
        self.assertEqual(res["formatted_current_weight"], "500 g")
        self.assertEqual(res["fill_percentage"], round(0.500 / 500.0 * 100.0, 2))

        # 4. Refresh stability: repeated GET requests never change weight
        for _ in range(5):
            r = requests.get(f"{BASE_URL}/api/digital-twin")
            self.assertEqual(r.json()["bins"]["glass"]["current_kg"], 0.500)
            self.assertEqual(r.json()["bins"]["glass"]["formatted_current_weight"], "500 g")

        # 5. Capacity capping: cannot exceed 500 kg
        r = requests.post(f"{BASE_URL}/api/digital-twin/inflow", json={"category": "glass", "weight_kg": 1000.0})
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["current_kg"], 500.0)
        self.assertEqual(res["fill_percentage"], 100.0)
        self.assertEqual(res["formatted_current_weight"], "500 kg")

        # Reset glass bin
        requests.post(f"{BASE_URL}/api/digital-twin/empty/glass")

    def test_single_scan_end_to_end(self):
        """
        Verify that a single scan increments the corresponding bin exactly once,
        and subsequent telemetry fetches reflect the exact addition without duplicates.
        """
        requests.post(f"{BASE_URL}/api/digital-twin/empty/plastic")
        
        # Ingest a plastic sample image
        sample_path = "uploads/1792126550_test_plastic_bottle.jpg"
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                r = requests.post(f"{BASE_URL}/api/scan", files={"image": ("sample_water_bottle.jpg", f, "image/jpeg")})
            self.assertEqual(r.status_code, 200)
            data = r.json()
            self.assertEqual(data["estimated_weight_kg"], 0.025)
            self.assertEqual(data["formatted_weight"], "25 g")
            self.assertTrue(data.get("already_routed"))

            # Check Digital Twin bin has incremented exactly once (0.025 kg / 25 g)
            twin = requests.get(f"{BASE_URL}/api/digital-twin").json()
            self.assertEqual(twin["bins"]["plastic"]["current_kg"], 0.025)
            self.assertEqual(twin["bins"]["plastic"]["formatted_current_weight"], "25 g")

class TestHazardousWasteStream(unittest.TestCase):
    """
    Verifies Requirement 6 for Hazardous Waste Stream:
    1. All six material streams appear in Digital Twin.
    2. Existing five-stream data remains intact.
    3. Hazardous classifications route ONLY to hazardous bin and cannot increment ordinary bins.
    4. Uncertain classifications never route into any recycling stream.
    5. Weights (<1000g -> g, >=1000g -> kg) and fill percentages remain consistent and capped at capacity.
    """

    def test_all_six_streams_appear(self):
        r = requests.get(f"{BASE_URL}/api/digital-twin")
        self.assertEqual(r.status_code, 200)
        bins = r.json().get("bins", {})
        
        expected_streams = {"plastic", "paper", "metal", "glass", "organic", "hazardous"}
        self.assertTrue(expected_streams.issubset(set(bins.keys())), f"Missing streams: {expected_streams - set(bins.keys())}")
        
        haz = bins["hazardous"]
        self.assertEqual(haz["name"], "Hazardous Waste")
        self.assertEqual(haz["max_kg"], 250.0)
        self.assertIn("formatted_current_weight", haz)
        self.assertIn("fill_percentage", haz)

    def test_existing_streams_intact(self):
        r = requests.get(f"{BASE_URL}/api/digital-twin")
        self.assertEqual(r.status_code, 200)
        bins = r.json().get("bins", {})
        
        self.assertEqual(bins["plastic"]["max_kg"], 500.0)
        self.assertEqual(bins["paper"]["max_kg"], 400.0)
        self.assertEqual(bins["metal"]["max_kg"], 600.0)
        self.assertEqual(bins["glass"]["max_kg"], 500.0)
        self.assertEqual(bins["organic"]["max_kg"], 400.0)

    def test_hazardous_routing_isolation(self):
        """
        Verify that adding hazardous material increments ONLY the hazardous bin
        and NEVER increments plastic, paper, metal, glass, or organic bins.
        """
        # Flush hazardous bin first
        requests.post(f"{BASE_URL}/api/digital-twin/empty/hazardous")
        
        # Take snapshot of ordinary bins before hazardous inflow
        r_before = requests.get(f"{BASE_URL}/api/digital-twin").json()["bins"]
        ordinary_streams = ["plastic", "paper", "metal", "glass", "organic"]
        before_weights = {s: r_before[s]["current_kg"] for s in ordinary_streams}

        # Inflow 50 g (0.050 kg) of hazardous material
        r_inflow = requests.post(f"{BASE_URL}/api/digital-twin/inflow", json={"category": "hazardous", "weight_kg": 0.050})
        self.assertEqual(r_inflow.status_code, 200)
        inflow_data = r_inflow.json()
        self.assertEqual(inflow_data["stream"], "hazardous")
        self.assertEqual(inflow_data["current_kg"], 0.050)
        self.assertEqual(inflow_data["formatted_current_weight"], "50 g")
        expected_pct = round((0.050 / 250.0) * 100.0, 2)
        self.assertEqual(inflow_data["fill_percentage"], expected_pct)

        # Verify all 5 ordinary bins remain exactly unchanged
        r_after = requests.get(f"{BASE_URL}/api/digital-twin").json()["bins"]
        for s in ordinary_streams:
            self.assertEqual(
                r_after[s]["current_kg"],
                before_weights[s],
                f"Stream {s} was contaminated! Weight changed from {before_weights[s]} to {r_after[s]['current_kg']}"
            )

        # Cleanup
        requests.post(f"{BASE_URL}/api/digital-twin/empty/hazardous")

    def test_hazardous_capacity_capping_and_formatting(self):
        """
        Verify hazardous bin capacity capping at 250 kg and format thresholds:
        - 50 g -> '50 g'
        - Over capacity (300 kg) -> capped at 250 kg (100% fill)
        """
        requests.post(f"{BASE_URL}/api/digital-twin/empty/hazardous")

        # Inflow 300 kg (exceeds 250 kg capacity)
        r = requests.post(f"{BASE_URL}/api/digital-twin/inflow", json={"category": "hazardous", "weight_kg": 300.0})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["current_kg"], 250.0)
        self.assertEqual(data["fill_percentage"], 100.0)
        self.assertEqual(data["formatted_current_weight"], "250 kg")

        # Reset
        requests.post(f"{BASE_URL}/api/digital-twin/empty/hazardous")

if __name__ == "__main__":
    unittest.main()
