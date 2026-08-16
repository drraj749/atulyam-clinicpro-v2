"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  orderNo: string;
  status: string;
  createdAt: string;

  patient: {
    patientId: string;
    firstName: string;
    lastName?: string;
  };

  items: {
    id: number;
    test: {
      testName: string;
    };
  }[];
};

export default function LabOrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const response = await fetch("/api/laboratory/orders");

      const result = await response.json();

      if (result.success) {
        setOrders(result.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Laboratory Orders
      </h2>

      <table className="w-full border">

        <thead className="bg-blue-700 text-white">

          <tr>

            <th className="p-3">Order No</th>

            <th className="p-3">Patient</th>

            <th className="p-3">Tests</th>

            <th className="p-3">Status</th>

            <th className="p-3">Date</th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (

            <tr
              key={order.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3 font-semibold">
                {order.orderNo}
              </td>

              <td className="p-3">
                {order.patient.patientId}
                <br />
                {order.patient.firstName}{" "}
                {order.patient.lastName}
              </td>

              <td className="p-3">

                {order.items.map((item) => (
                  <div key={item.id}>
                    • {item.test.testName}
                  </div>
                ))}

              </td>

              <td className="p-3">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  {order.status}
                </span>
              </td>

              <td className="p-3">
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}