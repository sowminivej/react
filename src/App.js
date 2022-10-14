import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <StyledTableCell  component="th" scope="row">
          {row.name}
        </StyledTableCell >
        <StyledTableCell  align="right">{row.customerId}</StyledTableCell >
        <StyledTableCell  align="right">{row.amount}</StyledTableCell >
        <StyledTableCell  align="right">{row.points}</StyledTableCell >
        <StyledTableCell  align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell >
      </TableRow>
      <TableRow>
        <StyledTableCell  style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transaction History
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell >Month</StyledTableCell >
                      <StyledTableCell >Amont ($)</StyledTableCell >
                      <StyledTableCell >Reward ponts</StyledTableCell >
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.history.map((historyRow) => (
                      <TableRow key={historyRow.date}>
                        <StyledTableCell  component="th" scope="row">
                          {historyRow.month}
                        </StyledTableCell >
                        <StyledTableCell >{historyRow.amount}</StyledTableCell >
                        <StyledTableCell >{historyRow.points}</StyledTableCell >
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </StyledTableCell >
      </TableRow>
    </React.Fragment>
  );
}

const calculatePoints = (transactionAmont) => {
  let rewardPoints = 0;
  const spentOver100 = transactionAmont - 100;
  if (spentOver100 > 0) {
    rewardPoints += (spentOver100 * 2);
  }
  if (transactionAmont > 50) {
    rewardPoints += 50;
  }
  return rewardPoints;
};

export default function App() {
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/rewards')
      .then(response => {
        const transformData = [];

        response.data.map(item => {
          const rewardPoint = calculatePoints(item.amount);
          const month = new Date(item.transactionDate).getMonth();
          const monthName = monthNames[month];
          const index = transformData.findIndex(data => data.name === item.name);
          if (index === -1) {
            transformData.push({
              name: item.name,
              customerId: item.customerId,
              amount: item.amount,
              points: rewardPoint,
              history: [{
                month: monthName,
                amount: item.amount,
                points: rewardPoint
              }]
            })
          } else {
            transformData[index].amount += item.amount;
            transformData[index].points += rewardPoint;
            const monthIndex = transformData[index].history.findIndex(data => data.month === monthName);
            if (monthIndex === -1) {
              transformData[index].history.push({
                month: monthName,
                amount: item.amount,
                points: rewardPoint
              })
            } else {
              transformData[index].history[monthIndex].amount += item.amount;
              transformData[index].history[monthIndex].points += rewardPoint;
            }
          }
        })
        setTransactionData(transformData);
      });
  }, []);


  console.log(transactionData);
  return (
    <Box m={2}>
      <Typography variant="h3" gutterBottom>
        Reward Points
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <StyledTableCell >Customer Name</StyledTableCell >
              <StyledTableCell  align="right">Customer ID</StyledTableCell >
              <StyledTableCell  align="right">Amount ($)</StyledTableCell >
              <StyledTableCell  align="right">Reward ponts</StyledTableCell >
              <StyledTableCell  />
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionData.map((row) => (
              <Row key={row.name} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
