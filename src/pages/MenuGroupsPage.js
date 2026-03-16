import React from "react";
import { Grid, Card, CardActionArea, Typography, Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { menuGroups } from "./menuData";
import "./navigation.css";

export default function MenuGroupsPage() {
  const navigate = useNavigate();

  return (
    <div className="nav-container">
      <Container maxWidth="xl">
        <Typography variant="h3" className="page-header">
          HOI Dashboard
        </Typography>

        <Grid container spacing={4}>
          {menuGroups.map((group, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={group.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="glass-card">
                <CardActionArea
                  onClick={() => navigate(`/menu/${group.id}`)}
                  sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                >
                  <div className="card-icon-wrapper">
                    {group.icon}
                  </div>
                  <Typography variant="h6" className="card-title">
                    {group.title}
                  </Typography>
                  <Typography variant="body2" className="card-subtitle">
                    {group.description}
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