import { StyleSheet } from "@react-pdf/renderer";

export const NAVY = "#1d3f6b";
export const INK = "#1a2330";
export const MUTED = "#5a6675";
export const FAINT = "#8b95a1";
export const LINE = "#d7dce2";
export const LINE_SOFT = "#eef0f3";
export const BG_SOFT = "#f5f7fa";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  top: {
    flexGrow: 1,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 14,
  },
  emitter: {
    flexDirection: "row",
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginRight: 12,
  },
  coName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: NAVY,
  },
  coLines: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 3,
    lineHeight: 1.5,
  },
  meta: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: NAVY,
    textTransform: "uppercase",
  },
  num: {
    fontSize: 10,
    color: INK,
    marginTop: 2,
  },
  metaLines: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 4,
    textAlign: "right",
    lineHeight: 1.5,
  },
  client: {
    marginTop: 18,
  },
  label: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: FAINT,
  },
  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 3,
  },
  clientLines: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 3,
    lineHeight: 1.5,
  },
  table: {
    marginTop: 18,
  },
  tr: {
    flexDirection: "row",
  },
  th: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: FAINT,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  td: {
    fontSize: 9,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: LINE_SOFT,
  },
  colLabel: { flex: 1, paddingRight: 6 },
  colQty: { width: 40, textAlign: "right" },
  colPrice: { width: 65, textAlign: "right" },
  colVat: { width: 45, textAlign: "right" },
  colTotal: { width: 65, textAlign: "right" },
  totals: {
    marginTop: 16,
    marginLeft: "auto",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED,
    marginBottom: 4,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    paddingTop: 6,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  depositRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: INK,
    marginTop: 3,
  },
  notes: {
    marginTop: 18,
    padding: 10,
    backgroundColor: BG_SOFT,
    borderRadius: 4,
    fontSize: 8.5,
    color: "#3a4655",
    lineHeight: 1.5,
  },
  foot: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LINE,
    fontSize: 7.5,
    color: FAINT,
    lineHeight: 1.6,
  },
});
