import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import moment from "moment";

const { Title, Paragraph } = Typography;

function EChartMarge({ invoices, viewMode = "monthly", yearFilter = null }) {
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        type: "category",
      },
      yaxis: {
        title: {
          text: "Marge (TND)",
        },
      },
      title: {
        text: "Analyse des Marges",
        align: "left",
      },
      colors: ["#1890ff", "#52c41a"],
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toFixed(2) + " TND";
          },
        },
      },
    },
  });

  useEffect(() => {
    if (!invoices || invoices.length === 0) return;

    const processData = () => {
      try {
        // Filter by year if specified
        const filteredInvoices = yearFilter
          ? invoices.filter((inv) => 
              moment(inv.date, 'MMMM Do YYYY, h:mm:ss a').year() === yearFilter
            )
          : invoices;

        if (viewMode === "monthly") {
          // Monthly view
          const months = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
          ];
          
          const monthlyData = months.map((month, index) => {
            const monthInvoices = filteredInvoices.filter(
              (inv) => moment(inv.date, 'MMMM Do YYYY, h:mm:ss a').month() === index
            );

            const total = monthInvoices.reduce(
              (sum, inv) => sum + (inv.totalMarge || 0),
              0
            );
            const count = monthInvoices.length;

            return {
              month: month.substring(0, 3), // Short month name
              total: parseFloat(total.toFixed(2)),
              count,
            };
          });

          return {
            categories: monthlyData.map((d) => d.month),
            series: [
              {
                name: "Marge Totale",
                data: monthlyData.map((d) => d.total),
              }
            ],
          };
        } else if (viewMode === "yearly") {
          // Yearly comparison
          const years = [
            ...new Set(invoices.map((inv) => 
              moment(inv.date, 'MMMM Do YYYY, h:mm:ss a').year()
            )),
          ].sort();

          const yearlyData = years.map((year) => {
            const yearInvoices = invoices.filter(
              (inv) => moment(inv.date, 'MMMM Do YYYY, h:mm:ss a').year() === year
            );

            const total = yearInvoices.reduce(
              (sum, inv) => sum + (inv.totalMarge || 0), 
              0
            );
            const count = yearInvoices.length;

            return {
              year: year.toString(),
              total: parseFloat(total.toFixed(2)),
              count,
            };
          });

          return {
            categories: yearlyData.map((d) => d.year),
            series: [
              {
                name: "Marge Totale",
                data: yearlyData.map((d) => d.total),
              }
            ],
          };
        }
      } catch (error) {
        console.error("Error processing data:", error);
        return { categories: [], series: [] };
      }
    };

    const { categories, series } = processData();

    setChartOptions((prev) => ({
      ...prev,
      series: series ?? [],
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: categories ?? [],
          labels: {
            style: {
              fontSize: viewMode === "yearly" ? '12px' : '10px',
            }
          }
        },
        title: {
          ...prev.options.title,
          text:
            viewMode === "yearly"
              ? `Comparaison annuelle des Marges${
                  yearFilter ? ` (Filtré: ${yearFilter})` : ""
                }`
              : `Analyse mensuelle des Marges${
                  yearFilter ? ` (Année: ${yearFilter})` : ""
                }`,
        },
      },
    }));
  }, [invoices, viewMode, yearFilter]);

  return (
    <div id="chart">
      <ReactApexChart
        options={chartOptions.options}
        series={chartOptions.series}
        type="bar"
        height={400}
      />
    </div>
  );
}

export default EChartMarge;