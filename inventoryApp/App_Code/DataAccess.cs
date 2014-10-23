using System;
using System.Data;
using System.Collections;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Data.SqlClient;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using JEncode;
using System.Drawing.Imaging;
using System.Text.RegularExpressions;
using System.Collections.Generic;

/// <summary>
/// Summary description for DataAccess
/// </summary>
public class DataAccess
{
    public SqlConnection conn = null;
    AccessDataSource dataSource;

    public string loadLayer(string layer)
    {
        DataTable dt = selectData("SELECT * FROM " + layer + ";");
        dt = dt.DefaultView.ToTable();

        string ness = convertDT(dt);
        string[] tblJson = new string[dt.Rows.Count];

        return (ness);
    }
    public string deleteLayer(string layer, string oid)
    {
        string query = "delete from " + layer + " where " + layer + ".OBJECTID = " + oid;
        dataSource = new AccessDataSource();
        dataSource.DataFile = @"E:\\WebSites\\StreetSignInventory\\Database\\Database.mdb";
        
        dataSource.DeleteCommand = query;
        dataSource.Delete();

        return "{\"val\" : true}";

    }
    public string updateLayer(string values, string layer)
    {
        ArrayList json = (ArrayList)JSON.JsonDecode(values);
        for (int i = 0; i < json.Count; i++)
        {
            Hashtable ht = new Hashtable();
            ht = (Hashtable)json[i];
            string[] fields = new string[ht.Values.Count - 2];
            string[] v = new string[ht.Values.Count - 2];
            int count = 0;
            string query = "";
            string status = ht["mapStatus"].ToString();
            if (status == "new")
            {
                foreach (DictionaryEntry pair in ht)
                {
                    if (pair.Key.ToString() != "mapStatus" && pair.Key.ToString() != "OBJECTID")
                    {
                        fields[count] = "[" + pair.Key.ToString() + "]";
                        if (pair.Value.ToString() != "")
                        {
                            v[count] = "'" + pair.Value.ToString() + "'";
                        }
                        else
                        {
                            v[count] = "null";
                        }
                        count++;
                    }
                }
                query = "INSERT INTO " + layer + " (" + String.Join(",", fields) + ") VALUES (" + String.Join(",", v) + ");";
                dataSource = new AccessDataSource();
                dataSource.DataFile = @"E:\\WebSites\\StreetSignInventory\\Database\\Database.mdb";
                dataSource.InsertCommand = query;
                dataSource.Insert();
            }
            else if (status == "changed")
            {
                foreach (DictionaryEntry pair in ht)
                {
                    if (pair.Key.ToString() != "mapStatus" && pair.Key.ToString() != "OBJECTID" && pair.Key.ToString() != "entryDate")
                    {
                        if (pair.Value == null)
                        {
                            fields[count] = layer + "." + pair.Key.ToString() + " = null";
                        }
                        else
                        {
                            fields[count] = layer + "." + pair.Key.ToString() + " = '" + pair.Value + "'";
                        }
                        count++;
                    }
                }
                query = "UPDATE " + layer + " SET " + String.Join(",", fields)  +  layer + ".entrydate = Now() WHERE ((" + layer + ".OBJECTID=" + ht["OBJECTID"] + "));";
                dataSource = new AccessDataSource();
                dataSource.DataFile = @"E:\\WebSites\\StreetSignInventory\\Database\\Database.mdb";
                dataSource.UpdateCommand = query;
                dataSource.Update();
            }
        }
        return loadLayer(layer);
    }
    public DataTable selectData(string query)
    {
        dataSource = new AccessDataSource();
        dataSource.DataFile = @"E:\\WebSites\\StreetSignInventory\\Database\\Database.mdb";
        dataSource.SelectCommand = query;

        DataView dv = (DataView)dataSource.Select(DataSourceSelectArguments.Empty);
        DataTable dts = dv.ToTable();
        dataSource.Dispose();
        dv.Dispose();
        return dts;
    }
    //converts a datatable to a string version of JSON so that it can be passed through the XHR
    public string convertDT(DataTable dt)
    {
        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();

        Dictionary<string, object> row;

        foreach (DataRow dr in dt.Rows)
        {
            row = new Dictionary<string, object>();

            foreach (DataColumn col in dt.Columns)
            {

                row.Add(col.ColumnName, dr[col]);

            }
            rows.Add(row);
        }
        Hashtable tblJson = new Hashtable();
        for (int i = 0; i < dt.Columns.Count; i++)
        {
            tblJson.Add(dt.Columns[i].ColumnName, dt.Columns[i].DataType.ToString());
        }
        string jsonString = JSON.JsonEncode(tblJson);
        row = new Dictionary<string, object>();
        row.Add("FieldInfo", jsonString);
        rows.Add(row);
        string oo = serializer.Serialize(rows);
        return serializer.Serialize(rows);
    }
}

