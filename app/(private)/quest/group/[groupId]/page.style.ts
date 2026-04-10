import { styled } from "@/styles/jsx"

export const GroupHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
})

export const GroupName = styled("h2", {
  base: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#333",
    margin: 0,
  },
})

export const Container = styled("div", {
  base: {
    display: "flex",
    height: "calc(100vh - 105px)",
    width: "100%",
    position: "relative",
  },
})

export const LeftPanel = styled("div", {
  base: {
    width: "240px",
    height: "100%",
    overflow: "auto",
    borderRight: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
})

export const MapContainer = styled("div", {
  base: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
})

export const RightPanel = styled("div", {
  base: {
    width: "400px",
    height: "100%",
    overflow: "auto",
    borderLeft: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
})

export const LoadingContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    fontSize: "16px",
    color: "#666",
  },
})

export const ErrorContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    fontSize: "16px",
    color: "#d32f2f",
  },
})
