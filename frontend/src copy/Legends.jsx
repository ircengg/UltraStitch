import { Paper, Stack, Text } from '@mantine/core'
import React from 'react'

const Legends = () => {
    return (
        < Paper
            style={{
                position: "fixed",
                top: "50px",
                left: "20px",
                width: "150px",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                zIndex: 1000,
            }
            }
        >
            <Text align="center" weight={700} mb="sm">
                Wall Loss Legend
            </Text>
            <Stack spacing="xs">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", backgroundColor: "rgba(0, 255, 0, 200)", marginRight: "10px" }}></div>
                    <Text> {"< 10%"} </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", backgroundColor: "rgba(255, 255, 0, 200)", marginRight: "10px" }}></div>
                    <Text>10% - 20%</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", backgroundColor: "rgba(204, 102, 0, 200)", marginRight: "10px" }}></div>
                    <Text> {"> 20%"} </Text>
                </div>
            </Stack>
        </Paper >

    )
}

export default Legends