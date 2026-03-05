import { TextField, MenuItem, Box } from "@mui/material";

const FormField = ({ label, type, name, value, onChange, options = [], ...rest }) => {
  const isSelect = type === "select";
  const isDate = type === "date";

  return (
    <Box mb={2}>
      {isSelect ? (
        <TextField
          select
          fullWidth
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 180 }}
          {...rest}
        >
          <MenuItem value="">-- Select --</MenuItem>
          {options.map((opt, idx) => (
            <MenuItem key={idx} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          fullWidth
          type={type}
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          variant="outlined"
          size="small"
          InputLabelProps={isDate ? { shrink: true } : {}}
          {...rest}
        />
      )}
    </Box>
  );
};

export default FormField;


