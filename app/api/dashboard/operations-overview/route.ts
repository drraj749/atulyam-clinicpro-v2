import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getDayRange(date: Date) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return {
    start,
    end,
  };
}

function getAttendanceDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const now = new Date();

    const {
      start: startOfToday,
      end: startOfTomorrow,
    } = getDayRange(now);

    const attendanceDate =
      getAttendanceDate(now);

    const [
      totalActiveStaff,
      todayAttendance,
      opdRevenue,
      ipdRevenue,
      labRevenue,
      pendingLabOrders,
      pendingInvestigations,
      activeMedications,
      ipdCharges,
      ipdPayments,
    ] = await Promise.all([
      prisma.staff.count({
        where: {
          isActive: true,
        },
      }),

      prisma.attendance.findMany({
        where: {
          attendanceDate,
        },
        select: {
          staffId: true,
          status: true,
          checkIn: true,
          checkOut: true,
        },
      }),

      prisma.opdVisit.aggregate({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          fee: true,
        },
      }),

      prisma.ipdPayment.aggregate({
        where: {
          paidAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.labSampleCollection.aggregate({
        where: {
          date: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          cost: true,
        },
      }),

      prisma.labOrder.count({
        where: {
          status: {
            not: "Reported",
          },
        },
      }),

      prisma.ipdInvestigation.count({
        where: {
          status: {
            not: "Completed",
          },
        },
      }),

      prisma.ipdMedicationOrder.count({
        where: {
          status: "Active",
        },
      }),

      prisma.ipdCharge.groupBy({
        by: ["admissionId"],
        _sum: {
          total: true,
        },
      }),

      prisma.ipdPayment.groupBy({
        by: ["admissionId"],
        _sum: {
          amount: true,
        },
      }),
    ]);

    const presentStaff =
      todayAttendance.filter(
        (item) =>
          item.status === "Present" ||
          item.status === "Half Day"
      ).length;

    const absentStaff =
      todayAttendance.filter(
        (item) =>
          item.status === "Absent"
      ).length;

    const leaveStaff =
      todayAttendance.filter(
        (item) =>
          item.status === "Leave"
      ).length;

    const checkedInStaff =
      todayAttendance.filter(
        (item) => item.checkIn
      ).length;

    const notMarkedStaff =
      Math.max(
        totalActiveStaff -
          todayAttendance.length,
        0
      );

    const chargeMap =
      new Map<number, number>();

    for (const charge of ipdCharges) {
      chargeMap.set(
        charge.admissionId,
        Number(charge._sum.total || 0)
      );
    }

    const paymentMap =
      new Map<number, number>();

    for (const payment of ipdPayments) {
      paymentMap.set(
        payment.admissionId,
        Number(payment._sum.amount || 0)
      );
    }

    const admissionIds =
      new Set<number>([
        ...chargeMap.keys(),
        ...paymentMap.keys(),
      ]);

    let outstandingAdmissions = 0;
    let totalOutstandingBalance = 0;

    admissionIds.forEach(
      (admissionId) => {
        const charges =
          chargeMap.get(admissionId) || 0;

        const payments =
          paymentMap.get(admissionId) || 0;

        const balance =
          charges - payments;

        if (balance > 0) {
          outstandingAdmissions += 1;
          totalOutstandingBalance +=
            balance;
        }
      }
    );

    const opdCollection =
      Number(opdRevenue._sum.fee || 0);

    const ipdCollection =
      Number(ipdRevenue._sum.amount || 0);

    const laboratoryCollection =
      Number(labRevenue._sum.cost || 0);

    const totalCollection =
      opdCollection +
      ipdCollection +
      laboratoryCollection;

    const weeklyFlow = [];

    for (
      let daysAgo = 6;
      daysAgo >= 0;
      daysAgo -= 1
    ) {
      const date = new Date();

      date.setDate(
        date.getDate() - daysAgo
      );

      const {
        start,
        end,
      } = getDayRange(date);

      const [
        opdCount,
        admissionCount,
        dischargeCount,
      ] = await Promise.all([
        prisma.opdVisit.count({
          where: {
            createdAt: {
              gte: start,
              lt: end,
            },
          },
        }),

        prisma.ipdAdmission.count({
          where: {
            admissionDate: {
              gte: start,
              lt: end,
            },
          },
        }),

        prisma.ipdAdmission.count({
          where: {
            status: "Discharged",
            dischargeDate: {
              gte: start,
              lt: end,
            },
          },
        }),
      ]);

      weeklyFlow.push({
        date: start.toISOString(),
        label: new Intl.DateTimeFormat(
          "en-IN",
          {
            weekday: "short",
          }
        ).format(start),
        opd: opdCount,
        admissions: admissionCount,
        discharges: dischargeCount,
      });
    }

    const alerts = [
      {
        id: "lab",
        title: "Pending Laboratory Orders",
        count: pendingLabOrders,
        description:
          "Laboratory orders still awaiting completion.",
        href: "/laboratory",
        level:
          pendingLabOrders > 0
            ? "warning"
            : "success",
      },

      {
        id: "investigations",
        title: "Pending IPD Investigations",
        count: pendingInvestigations,
        description:
          "IPD investigations awaiting reporting or completion.",
        href: "/ipd",
        level:
          pendingInvestigations > 0
            ? "warning"
            : "success",
      },

      {
        id: "medications",
        title: "Active IPD Medication Orders",
        count: activeMedications,
        description:
          "Currently active medication orders in IPD.",
        href: "/ipd",
        level:
          activeMedications > 0
            ? "info"
            : "success",
      },

      {
        id: "balances",
        title: "Outstanding IPD Balances",
        count: outstandingAdmissions,
        description: `₹${totalOutstandingBalance.toLocaleString(
          "en-IN"
        )} pending across IPD admissions.`,
        href: "/ipd",
        level:
          outstandingAdmissions > 0
            ? "danger"
            : "success",
      },

      {
        id: "attendance",
        title: "Attendance Not Marked",
        count: notMarkedStaff,
        description:
          "Active staff members without attendance for today.",
        href: "/attendance",
        level:
          notMarkedStaff > 0
            ? "warning"
            : "success",
      },
    ];

    return NextResponse.json({
      success: true,

      operations: {
        staff: {
          totalActiveStaff,
          presentStaff,
          absentStaff,
          leaveStaff,
          checkedInStaff,
          notMarkedStaff,
        },

        revenue: {
          opdCollection,
          ipdCollection,
          laboratoryCollection,
          totalCollection,
        },

        alerts,

        outstanding: {
          admissions:
            outstandingAdmissions,
          amount:
            totalOutstandingBalance,
        },

        weeklyFlow,
      },
    });
  } catch (error) {
    console.error(
      "OPERATIONS OVERVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load hospital operations overview.",
      },
      {
        status: 500,
      }
    );
  }
}