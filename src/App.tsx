import { useEffect, useMemo, useState } from "react";
import { Line } from "@ant-design/charts";
import { Select } from "antd";

const q = {
  query: "короткая рубашка",
  skus: [150533210, 150286356],
  data: {
    "150286356": {
      "2023-04-09_13": {
        pos: 2789,
        page: 28,
        date: "2023-04-09 13:48:46",
      },
      "2023-04-09_17": {
        pos: 94,
        page: 1,
        date: "2023-04-09 17:59:01",
      },
      "2023-04-09_18": {
        pos: 143,
        page: 2,
        date: "2023-04-09 18:09:09",
      },
    },
    "150533210": {
      "2023-04-09_17": {
        pos: 146,
        page: 2,
        date: "2023-04-09 17:59:01",
      },
      "2023-04-09_18": {
        pos: 146,
        page: 2,
        date: "2023-04-09 18:09:09",
      },
    },
  },
};

type ServerData = {
  query: string;
  skus: number[];
  data: Record<
    string,
    Record<
      string,
      {
        pos: number;
        page: number;
        date: string;
      }
    >
  >;
};

function App() {
  const [data, setData] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const response = await fetch(
      "https://node-cron-production-9709.up.railway.app/results"
    ).then((res) => res.json());

    setSelected(response[0].query);
    setData(response);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedData = useMemo(() => {
    const result: any[] = [];

    if (data.length) {
      const selectedData = data.find((item) => item.query === selected);

      if (selectedData) {
        const { data: selectedDataData } = selectedData;

        Object.keys(selectedDataData).forEach((sku) => {
          Object.keys(selectedDataData[sku]).forEach((key) => {
            const { pos, page, date } = selectedDataData[sku][key];

            result.push({
              query: selected,
              sku,
              date: date,
              position: pos,
              category: sku,
            });
          });
        });
      }
    }

    return result.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [data, selected]);

  const options = useMemo(() => {
    return data.map((item) => ({
      label: item.query,
      value: item.query,
    }));
  }, [data]);

  console.log(selected, options, formattedData);

  const config = {
    data: formattedData,
    xField: "date",
    yField: "position",
    seriesField: "category",
    yAxis: {
      label: {
        // 数值格式化为千分位
        formatter: (v: string) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    color: ["#1979C9", "#D62A0D", "#FAA219"],
  };

  return (
    <div>
      {loading ? null : (
        <>
          <div className="mb-2">
            <Select
              options={options}
              defaultValue={options[0]}
              onChange={(value) => {
                console.log("onChange: ", value);
                setSelected(value as any as string);
              }}
            />
          </div>
          <Line {...config} />;
        </>
      )}
    </div>
  );
}

export default App;
