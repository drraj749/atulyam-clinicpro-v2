"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    title: "Dashboard",
    items: [
      {
        name: "Dashboard",
        href: "/",
      },
    ],
  },

  {
    title: "Patient Management",
    items: [
      {
        name: "Patients",
        href: "/patients",
      },
      {
        name: "New Patient",
        href: "/patients/new",
      },
      {
        name: "OPD",
        href: "/opd/select",
      },
    ],
  },

  {
    title: "Staff Management",
    items: [
      {
        name: "Staff",
        href: "/staff",
      },
      {
        name: "Attendance",
        href: "/attendance",
      },
    ],
  },

  {
    title: "Master Data",
    items: [
      {
        name: "Medicines",
        href: "/medicines",
      },
      {
        name: "Disease Templates",
        href: "/disease-templates",
      },
      {
        name: "Laboratory",
        href: "/laboratory",
      },
      {
        name: "Settings",
        href: "/settings",
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        name: "Reports",
        href: "/reports",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">

      {/* HOSPITAL HEADER */}

      <div className="p-6 border-b border-blue-800">

        <h1 className="text-2xl font-bold">
          🏥 Atulyam Hospital
        </h1>

        <p className="text-sm text-blue-200 mt-1">
          Born To Serve
        </p>

      </div>

      {/* MENU */}

      <nav className="flex-1 overflow-y-auto p-4">

        {menu.map((section) => (

          <div
            key={section.title}
            className="mb-6"
          >

            <h3 className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-2 px-2">
              {section.title}
            </h3>

            {section.items.map((item) => {

              const isActive =
                pathname === item.href ||
                pathname.startsWith(
                  item.href + "/"
                );

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 mb-1 transition ${
                    isActive
                      ? "bg-white text-blue-900 font-semibold shadow"
                      : "hover:bg-blue-800"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

          </div>

        ))}

      </nav>

      {/* DOCTOR */}

      <div className="p-4 border-t border-blue-800">

        <p className="font-semibold">
          Dr. Rahul Kumar
        </p>

        <p className="text-sm text-blue-200">
          Consultant Physician
        </p>

      </div>

    </aside>
  );
}