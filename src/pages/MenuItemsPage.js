import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { menuGroups } from "./menuData";
import { Grid, Card, CardActionArea, Typography, Box, Container, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "./navigation.css";

export default function MenuItemsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const group = menuGroups.find(g => g.id === groupId);

  if (!group) return (
    <Box p={4} textAlign="center">
      <Typography variant="h5">Group not found</Typography>
      <Button onClick={() => navigate("/menugrouppage")}>Go Back</Button>
    </Box>
  );

  return (
    <div className="nav-container">
      <Container maxWidth="xl">
        <Button 
          startIcon={<ArrowBackIcon />} 
          className="back-button"
          onClick={() => navigate("/menugrouppage")}
        >
          Back to Dashboard
        </Button>

        <Typography variant="h3" className="page-header">
          {group.title}
        </Typography>

        <Grid container spacing={4}>
          {group.items.map((item, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="glass-card">
                <CardActionArea
                  onClick={() => navigate(item.path)}
                  sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                >
                  <div className="card-icon-wrapper" style={{ marginBottom: "1rem" }}>
                    {item.icon}
                  </div>
                  <Typography variant="h6" className="card-title" align="center">
                    {item.name}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}