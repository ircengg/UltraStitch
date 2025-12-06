import { Group, Line, Text } from "react-konva";
import { useRecoilValue } from "recoil";
import { drawingAtom, mesurementAtom, newMesaurementAtom, selectedObjectAtom } from "../atom";
import { useRecoilState } from "recoil";

export const Measurements = () => {
    const measurements = useRecoilValue(mesurementAtom);
    const newMeasurement = useRecoilValue(newMesaurementAtom);
    const [selectedObj, setSelectedObj] = useRecoilState(selectedObjectAtom)
    return <>
        {measurements.map(m => <Dimension key={m.id} dimension={m} />)}
        {newMeasurement && <Dimension dimension={newMeasurement} />}
    </>;
};



const Dimension = ({ dimension }) => {
    const drawing = useRecoilValue(drawingAtom);
    const [selected, setSelected] = useRecoilState(selectedObjectAtom);
    const { fontColor, fontSize } = drawing;

    const ARROW_SIZE = 40;     // size of arrow head (mm)
    const TEXT_OFFSET = 25;    // offset away from the line (mm)
    let m = dimension;
    if (!m.p1 || !m.p2) return null;
    const { p1, p2, distance } = m;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;

    // unit direction vector along dimension line
    const ux = dx / len;
    const uy = dy / len;

    // unit perpendicular vector
    const nx = -uy;
    const ny = ux;

    // Arrowhead coordinates
    const arrow1 = [
        p1.x, p1.y,
        p1.x + (-ux * ARROW_SIZE + nx * ARROW_SIZE * 0.4),
        p1.y + (-uy * ARROW_SIZE + ny * ARROW_SIZE * 0.4),
        p1.x + (-ux * ARROW_SIZE - nx * ARROW_SIZE * 0.4),
        p1.y + (-uy * ARROW_SIZE - ny * ARROW_SIZE * 0.4)
    ];

    const arrow2 = [
        p2.x, p2.y,
        p2.x + (ux * ARROW_SIZE + nx * ARROW_SIZE * 0.4),
        p2.y + (uy * ARROW_SIZE + ny * ARROW_SIZE * 0.4),
        p2.x + (ux * ARROW_SIZE - nx * ARROW_SIZE * 0.4),
        p2.y + (uy * ARROW_SIZE - ny * ARROW_SIZE * 0.4)
    ];

    // Midpoint
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // Move text slightly off the line
    const textX = midX + nx * TEXT_OFFSET;
    const textY = midY + ny * TEXT_OFFSET;

    const distMM = Math.round(distance || 0);

    const isSelected = (selected.type == "dimension" && selected?.obj?.id == dimension.id)

    return <Group
    // listening={false}

    >
        {/* Main dimension line */}
        <Line
            points={[p1.x, p1.y, p2.x, p2.y]}
            stroke={isSelected ? "blue" : fontColor}
            strokeWidth={isSelected ? 12 : 6}
            onClick={e => {
                console.log(dimension)
                setSelected({ type: "dimension", obj: dimension });

            }}
        />

        {/* Left arrow */}
        <Line
            points={arrow1}
            stroke={fontColor}
            strokeWidth={6}
            closed
        />

        {/* Right arrow */}
        <Line
            points={arrow2}
            stroke={fontColor}
            strokeWidth={6}
            closed
        />

        {/* Distance Text */}
        <Text
            x={textX}
            y={textY}
            text={`${distMM} mm`}
            fontSize={fontSize}
            fill={fontColor}
            offsetX={40}
            offsetY={10}
        />
    </Group>
}


